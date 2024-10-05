export const questions = [
	{
		id: "Q1",
		text: "Poste",
		options: [
			{ id: 1, text: "Cinéville", next: "Q2" },
			{ id: 2, text: "Gare de Bruz", next: "Q2" },
		],
	},
	{
		id: "Q2",
		text: "De quelle commune venez vous ?",
		options: [
			{ id: 1, text: "Bruz", next: "Q2a" },
			{ id: 2, text: "Autre", next: "Q2b" },
		],
	},
	{
		id: "Q2a",
		text: "Si vous venez de Bruz, quelle est votre adresse ? (nom de la Rue), Précisez quartier, proximité de quel équipement, commerce ..",
		freeText: true,
		next: "Q3",
	},
	{
		id: "Q2b",
		text: "Précisez la ville",
		usesCommuneSelector: true,  // Add this flag to indicate it uses CommuneSelector
		next: "Q3"  // Explicitly set the next question
	},
	{
		id: "Q3",
		text: (answers) => `Par quel mode de transport principal êtes-vous arrivés ${answers.Q1 === 1 ? "à Cinéville" : "à la gare"} ?`,
		options: [
			{ id: 1, text: "à pied exclusivement", next: "Q4" },
			{ id: 2, text: "en bus/car", next: "Q4" },
			{ id: 3, text: "en voiture conducteur", next: "Q4" },
			{ id: 4, text: "en voiture passager", next: "Q4" },
			{ id: 5, text: "en deux-roues motorisés", next: "Q4" },
			{ id: 6, text: "en vélo", next: "Q4" },
			{ id: 7, text: "en Trottinette / roue..", next: "Q4" },
			{ id: 8, text: "Autre", next: "Q3a" },
		],
	},
	{
		id: "Q3a",
		text: "Précisez",
		freeText: true,
		next: "Q4",
	},
	{
		id: "Q4",
		text: (answers) => answers.Q1 === 1 
			? "Venez-vous souvent au Cinéma ?" 
			: "A quelle fréquence prenez-vous le train à cette gare ?",
		options: (answers) => answers.Q1 === 1 
			? [
				{ id: 1, text: "Une fois par semaine", next: "Q5" },
				{ id: 2, text: "Plusieurs fois par mois", next: "Q5" },
				{ id: 3, text: "Une fois par mois", next: "Q5" },
				{ id: 4, text: "Moins d'une fois par mois", next: "Q4a" },
			]
			: [
				{ id: 1, text: "Tous les jours de la semaine ou presque", next: "Q5" },
				{ id: 2, text: "Plusieurs fois par mois", next: "Q5" },
				{ id: 3, text: "Une fois par mois", next: "Q5" },
				{ id: 4, text: "Moins d'une fois par mois", next: "Q5" },
				{ id: 5, text: "Tous les ans", next: "Q5" },
				{ id: 6, text: "C'est la première fois", next: "Q5" },
			],
	},
	{
		id: "Q4a",
		text: "Si moins d'1 fois par mois - notez le nombre de fois par an.",
		freeText: true,
		next: "Q5",
		condition: (answers) => answers.Q3 === 1 && answers.Q4 === 4,
	},
	{
		id: "Q5",
		text: (answers) => `Selon vous, que faut-il faire en priorité pour améliorer les conditions d'accès ${answers.Q1 === 1 ? "au cinéma" : "à la gare"} ?`,
		freeText: true,
		next: "end",
	},
];