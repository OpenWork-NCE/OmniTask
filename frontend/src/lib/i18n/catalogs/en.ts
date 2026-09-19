export const en = {
  navigation: {
    tasks: "Tasks",
    account: "Account",
    signOut: "Sign out",
    openMenu: "Open navigation",
    closeMenu: "Close navigation"
  },
  auth: {
    storyTitle: "Make space for work that matters.",
    login: {
      eyebrow: "Welcome back",
      title: "Sign in",
      description: "Pick up your priorities exactly where you left them.",
      action: "Sign in",
      pending: "Signing in...",
      noAccount: "New to OmniTask?",
      registerLink: "Create an account"
    },
    register: {
      eyebrow: "Start with clarity",
      title: "Create your OmniTask account",
      description: "A focused workspace for the work that matters.",
      action: "Create account",
      pending: "Creating account...",
      hasAccount: "Already have an account?",
      loginLink: "Sign in"
    },
    fields: {
      name: "Full name",
      email: "Email address",
      password: "Password",
      passwordHint: "Use at least 12 characters.",
      showPassword: "Show password",
      hidePassword: "Hide password"
    },
    validation: {
      emailRequired: "Enter your email address.",
      emailInvalid: "Enter a valid email address.",
      emailTooLong: "Email address must contain no more than 254 characters.",
      passwordRequired: "Enter your password.",
      passwordTooShort: "Password must contain at least 12 characters.",
      passwordTooLong: "Password must contain no more than 128 characters."
    },
    notices: {
      accountCreated: "Your account is ready. Sign in to continue."
    }
  },
  tasks: {
    eyebrow: "Your workspace",
    title: "Move meaningful work forward",
    description: "Plan, prioritize and finish each commitment with confidence.",
    actions: {
      create: "Create a task",
      edit: "Edit task",
      delete: "Delete task",
      save: "Save changes",
      cancel: "Cancel",
      retry: "Try again"
    },
    fields: {
      title: "Title",
      description: "Description",
      status: "Status",
      version: "Version"
    },
    empty: {
      title: "No tasks yet",
      description: "Create your first task and give today a clear direction.",
      filteredTitle: "No matching tasks",
      filteredDescription: "Adjust your search or status filter."
    },
    search: {
      label: "Search tasks",
      placeholder: "Search by title or description"
    },
    count: "{{formattedCount}} task",
    count_other: "{{formattedCount}} tasks"
  },
  status: {
    label: "Task status",
    all: "All statuses",
    todo: "To do",
    inProgress: "In progress",
    done: "Done"
  },
  pagination: {
    label: "Task pages",
    previous: "Previous page",
    next: "Next page",
    page: "Page {{current}} of {{total}}"
  },
  dialogs: {
    createTitle: "Create a task",
    editTitle: "Edit task",
    deleteTitle: "Delete this task?",
    deleteDescription: "This action permanently removes “{{title}}”.",
    confirmDelete: "Delete task"
  },
  errors: {
    generic: "Something went wrong. Please try again.",
    network: "The service is unavailable. Check your connection and try again.",
    validation: "Review the highlighted fields.",
    invalidCredentials: "The email address or password is incorrect.",
    duplicateEmail: "An account already exists for this email address.",
    sessionExpired: "Your session has expired",
    conflict: "This task changed while you were editing it. The latest version is now displayed."
  },
  toasts: {
    taskCreated: "Task created",
    taskUpdated: "Task updated",
    taskDeleted: "Task deleted",
    signedOut: "You have signed out"
  },
  accessibility: {
    skipToContent: "Skip to main content",
    loading: "Loading",
    theme: "Color theme",
    language: "Language",
    close: "Close"
  },
  theme: {
    system: "System",
    light: "Light",
    dark: "Dark"
  },
  language: {
    english: "English",
    french: "French"
  },
  notFound: {
    eyebrow: "404",
    title: "This page is out of reach",
    description: "The address may be incorrect or the page may have moved.",
    action: "Return to tasks"
  }
} as const;
