import type { LocaleCatalog } from "../i18n-types";

export const fr = {
  navigation: {
    tasks: "Tâches",
    account: "Compte",
    signOut: "Se déconnecter",
    openMenu: "Ouvrir la navigation",
    closeMenu: "Fermer la navigation"
  },
  auth: {
    login: {
      eyebrow: "Heureux de vous revoir",
      title: "Connectez-vous à votre espace",
      description: "Retrouvez vos priorités exactement là où vous les aviez laissées.",
      action: "Se connecter",
      pending: "Connexion en cours...",
      noAccount: "Vous découvrez OmniTask ?",
      registerLink: "Créer un compte"
    },
    register: {
      eyebrow: "Commencez avec clarté",
      title: "Créez votre compte OmniTask",
      description: "Un espace ciblé pour avancer sur ce qui compte.",
      action: "Créer le compte",
      pending: "Création du compte...",
      hasAccount: "Vous avez déjà un compte ?",
      loginLink: "Se connecter"
    },
    fields: {
      name: "Nom complet",
      email: "Adresse e-mail",
      password: "Mot de passe",
      passwordHint: "Utilisez au moins 12 caractères."
    }
  },
  tasks: {
    eyebrow: "Votre espace",
    title: "Faites avancer l’essentiel",
    description: "Planifiez, hiérarchisez et accomplissez chaque engagement avec confiance.",
    actions: {
      create: "Créer une tâche",
      edit: "Modifier la tâche",
      delete: "Supprimer la tâche",
      save: "Enregistrer",
      cancel: "Annuler",
      retry: "Réessayer"
    },
    fields: {
      title: "Titre",
      description: "Description",
      status: "Statut",
      version: "Version"
    },
    empty: {
      title: "Aucune tâche pour le moment",
      description: "Créez votre première tâche et donnez une direction claire à votre journée.",
      filteredTitle: "Aucune tâche correspondante",
      filteredDescription: "Modifiez votre recherche ou le filtre de statut."
    },
    search: {
      label: "Rechercher des tâches",
      placeholder: "Rechercher par titre ou description"
    },
    count: "{{count}} tâche",
    count_other: "{{count}} tâches"
  },
  status: {
    label: "Statut de la tâche",
    all: "Tous les statuts",
    todo: "À faire",
    inProgress: "En cours",
    done: "Terminée"
  },
  pagination: {
    label: "Pages de tâches",
    previous: "Page précédente",
    next: "Page suivante",
    page: "Page {{current}} sur {{total}}"
  },
  dialogs: {
    createTitle: "Créer une tâche",
    editTitle: "Modifier la tâche",
    deleteTitle: "Supprimer cette tâche ?",
    deleteDescription: "Cette action supprimera définitivement « {{title}} ».",
    confirmDelete: "Supprimer la tâche"
  },
  errors: {
    generic: "Une erreur est survenue. Veuillez réessayer.",
    network: "Le service est indisponible. Vérifiez votre connexion et réessayez.",
    validation: "Vérifiez les champs signalés.",
    invalidCredentials: "L’adresse e-mail ou le mot de passe est incorrect.",
    duplicateEmail: "Un compte existe déjà pour cette adresse e-mail.",
    sessionExpired: "Votre session a expiré",
    conflict: "Cette tâche a changé pendant votre modification. La dernière version est affichée."
  },
  toasts: {
    taskCreated: "Tâche créée",
    taskUpdated: "Tâche mise à jour",
    taskDeleted: "Tâche supprimée",
    signedOut: "Vous êtes déconnecté"
  },
  accessibility: {
    skipToContent: "Aller au contenu principal",
    loading: "Chargement",
    theme: "Thème de couleur",
    language: "Langue",
    close: "Fermer"
  },
  theme: {
    system: "Système",
    light: "Clair",
    dark: "Sombre"
  },
  language: {
    english: "Anglais",
    french: "Français"
  },
  notFound: {
    eyebrow: "404",
    title: "Cette page est introuvable",
    description: "L’adresse est peut-être incorrecte ou la page a été déplacée.",
    action: "Revenir aux tâches"
  }
} as const satisfies LocaleCatalog;
