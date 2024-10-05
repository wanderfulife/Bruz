<template>
  <div>
    <button class="btn-signin" @click="showSignInModal = true">
      Connexion Admin
    </button>

    <!-- Sign In Modal -->
    <div v-if="showSignInModal" class="modal">
      <div class="modal-content signin-modal">
        <button class="close" @click="showSignInModal = false">&times;</button>
        <h2>Connexion Admin</h2>
        <input
          v-model="password"
          type="password"
          placeholder="Entrez le mot de passe"
          class="form-control"
        />
        <button @click="signIn" class="btn-signin">Se connecter</button>
      </div>
    </div>

    <!-- Admin Dashboard Modal -->
    <div v-if="showAdminDashboard" class="modal">
      <div class="modal-content admin-dashboard">
        <button class="close" @click="showAdminDashboard = false">
          &times;
        </button>
        <h2>Tableau de Bord Admin</h2>
        <div class="dashboard-content">
          <div class="dashboard-card total">
            <h3>Total des Enquêtes</h3>
            <p class="big-number">{{ totalSurveys }}</p>
          </div>
          <div class="dashboard-card">
            <h3>Enquêtes par Enquêteur</h3>
            <ul>
              <li v-for="(count, name) in surveysByEnqueteur" :key="name">
                <span>{{ name }}</span>
                <span class="count">{{ count }}</span>
              </li>
            </ul>
          </div>
        </div>
        <button @click="downloadData" class="btn-download">
          Télécharger les Données
        </button>
      </div>
    </div>
  </div>
</template>
  
  <script setup>
import { ref, computed, onMounted } from "vue";
import * as XLSX from "xlsx";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

const props = defineProps({
  questions: {
    type: Array,
    required: true,
  },
});

const showSignInModal = ref(false);
const showAdminDashboard = ref(false);
const password = ref("");
const totalSurveys = ref(0);
const surveysByEnqueteur = ref({});
const surveysByType = ref({});

const surveyCollectionRef = collection(db, "Bruz");

const signIn = () => {
  // Implement your sign-in logic here
  if (password.value === "admin123") {
    showSignInModal.value = false;
    showAdminDashboard.value = true;
    fetchDashboardData();
  } else {
    alert("Mot de passe incorrect");
  }
};

const fetchDashboardData = async () => {
  const querySnapshot = await getDocs(surveyCollectionRef);
  totalSurveys.value = querySnapshot.size;

  const enqueteurCounts = {};
  const typeCounts = {};

  querySnapshot.forEach((doc) => {
    const data = doc.data();

    // Count by enqueteur
    const enqueteur = data.ENQUETEUR || "Unknown";
    enqueteurCounts[enqueteur] = (enqueteurCounts[enqueteur] || 0) + 1;

    // Count by type (assuming Q1 represents the type)
    const type = data.Q1 || "Unknown";
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  surveysByEnqueteur.value = enqueteurCounts;
  surveysByType.value = typeCounts;
};
const downloadData = async () => {
  try {
    const querySnapshot = await getDocs(surveyCollectionRef);

    const headerOrder = [
      "ID_questionnaire",
      "ENQUETEUR",
      "DATE",
      "JOUR",
      "HEURE_DEBUT",
      "HEURE_FIN",
    ];

    let portIdOriginInserted = false;
    let portIdDestinationInserted = false;

    props.questions.forEach((question) => {
      if (question.usesCommuneSelector) {
        headerOrder.push(
          `${question.id}_COMMUNE`,
          `${question.id}_CODE_INSEE`,
          `${question.id}_COMMUNE_LIBRE`
        );
      } else {
        headerOrder.push(question.id);
      }

      // Insert PORT_ID_ORIGIN right after Q9bisPL
      if (question.id === "Q9bisPL" && !portIdOriginInserted) {
        headerOrder.push("PORT_ID_ORIGIN");
        portIdOriginInserted = true;
      }

      // Insert PORT_ID_DESTINATION right after Q11bisPL
      if (question.id === "Q11bisPL" && !portIdDestinationInserted) {
        headerOrder.push("PORT_ID_DESTINATION");
        portIdDestinationInserted = true;
      }
    });

    const data = querySnapshot.docs.map((doc) => {
      const docData = doc.data();
      return headerOrder.reduce((acc, key) => {
        if (key === "PORT_ID_ORIGIN") {
          acc[key] = docData["Q9bisPL"] === 1 ? docData[key] || "" : "";
        } else if (key === "PORT_ID_DESTINATION") {
          acc[key] = docData["Q11bisPL"] === 1 ? docData[key] || "" : "";
        } else if (
          key.includes("_COMMUNE") ||
          key.includes("_CODE_INSEE") ||
          key.includes("_COMMUNE_LIBRE")
        ) {
          acc[key] = docData[key] || "";
        } else {
          // Include all responses, even if they are 0
          acc[key] = docData[key] !== undefined ? docData[key] : "";
        }
        return acc;
      }, {});
    });

    const worksheet = XLSX.utils.json_to_sheet(data, { header: headerOrder });

    // Set column widths
    const colWidths = headerOrder.map(() => ({ wch: 20 }));
    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Survey Data");

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    XLSX.writeFile(workbook, `Bruz_Survey_Data_${timestamp}.xlsx`);

    console.log("File downloaded successfully");
  } catch (error) {
    console.error("Error downloading data:", error);
  }
};

onMounted(() => {
  // You can add any initialization logic here if needed
});
</script>

<style scoped>
.btn-signin {
  background-color: #4caf50;
  color: #ffffff;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  padding: 12px 24px;
  border-radius: 30px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.btn-signin:hover {
  background-color: #45a049;
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

/* Keep the rest of the styles unchanged */
.btn-download {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
  width: 100%;
  margin-top: 20px;
}

.btn-download:hover {
  background-color: #2980b9;
}

.modal {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #2c3e50;
  color: #ecf0f1;
  padding: 20px;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close {
  position: fixed;
  /* Change from absolute to fixed */
  right: 20px;
  top: 20px;
  font-size: 28px;
  font-weight: bold;
  color: #bdc3c7;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 1010;
  /* Ensure it's above other content */
}

.close:hover {
  color: #ecf0f1;
}

.dashboard-content {
  display: grid;
  gap: 20px;
  margin-bottom: 20px;
}

.dashboard-card {
  background-color: #34495e;
  border-radius: 8px;
  padding: 15px;
}

.dashboard-card h3 {
  margin-top: 0;
  color: #3498db;
}

.dashboard-card ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.dashboard-card li {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.big-number {
  font-size: 3em;
  font-weight: bold;
  color: #2ecc71;
  margin: 10px 0;
}

.count {
  font-weight: bold;
  color: #2ecc71;
}

.form-control {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #34495e;
  border-radius: 5px;
  background-color: #34495e;
  color: #ecf0f1;
}

@media (max-width: 600px) {
  .modal-content {
    width: 100%;
    height: 100%;
    border-radius: 0;
    max-height: 100vh;
  }

  .close {
    top: 10px;
    right: 10px;
  }
}
</style>