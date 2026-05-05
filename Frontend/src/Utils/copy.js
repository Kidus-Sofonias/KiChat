export const LANGUAGE_OPTIONS = [
  { id: "en", label: "English" },
  { id: "sw", label: "Kiswahili" },
  { id: "fr", label: "Francais" },
  { id: "am", label: "Amharic" },
];

export const THEME_OPTIONS = [
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
];

export const APP_COPY = {
  en: {
    common: {
      appName: "KiChat",
      home: "Home",
      chat: "Chat",
      settings: "Settings",
      signIn: "Sign in",
      signUp: "Sign up",
      signOut: "Sign out",
      openChats: "Open my chats",
      account: "Account",
      guest: "Guest",
      dark: "Dark mode",
      light: "Light mode",
      language: "Language",
      appearance: "Appearance",
      saveChanges: "Saved instantly",
    },
    header: {
      badge: "Orbit control",
      tagline: "Robot messaging with glassy space visuals",
      settings: "Settings",
      launch: "Launch chat",
      create: "Create account",
    },
    footer: {
      line:
        "Built for robot-first conversations, richer media, and a cleaner launch flow.",
      rights: "All rights reserved.",
    },
    home: {
      kicker: "Mission control",
      title:
        "Launch your robot crew into chat with a more cinematic space theme.",
      description:
        "KiChat now leans into a glassy cockpit feel with animated nebula backgrounds, robot identity, richer media, and a cleaner route into conversation.",
      primarySignedOut: "Create your account",
      primarySignedIn: "Open my chats",
      secondarySignedOut: "I already have an account",
      secondarySignedIn: "Go straight to messaging",
      support: [
        "Choose a robot avatar before you even enter chat.",
        "Send text, images, videos, files, links, and recorded audio.",
        "Tune the interface in Settings with language and theme options.",
      ],
      orbitLabels: ["Voice-ready", "Link preview", "Nebula media"],
      metrics: [
        {
          value: "2 themes",
          label: "Switch between light and dark cockpit modes instantly.",
        },
        {
          value: "4 languages",
          label: "Shape the interface in English, Kiswahili, Francais, or Amharic.",
        },
        {
          value: "8 bots",
          label: "Robot avatars give every account a clearer personality.",
        },
      ],
      features: [
        {
          title: "Responsive by default",
          copy: "Cards, panels, and controls now scale more smoothly across phones, tablets, and desktop.",
        },
        {
          title: "Space-glass interface",
          copy: "The app now uses layered gradients, blur, and reflective panels for a more premium feel.",
        },
        {
          title: "Voice and media ready",
          copy: "Images, videos, files, voice notes, and links still live in the same composer flow.",
        },
        {
          title: "Robot identity",
          copy: "Signup still starts with avatar selection so each account feels alive from the first step.",
        },
        {
          title: "Live settings",
          copy: "Change language and theme from a dedicated settings page and watch the UI update instantly.",
        },
        {
          title: "Animated atmosphere",
          copy: "Nebula layers, orbital motion, and glass highlights make the app feel less static.",
        },
      ],
      panelKicker: "Designed like a cockpit",
      panelTitle:
        "Guide people into chat with clearer visuals, better motion, and less friction.",
      panelDescription:
        "The refreshed flow gives people a stronger first impression while keeping the app readable and responsive.",
      panelList: [
        {
          title: "Robot-first onboarding",
          copy: "People meet the avatar system early instead of discovering it late.",
        },
        {
          title: "Glass surfaces",
          copy: "Panels float on layered space backdrops instead of flat blocks of color.",
        },
        {
          title: "Settings that matter",
          copy: "Theme and language choices now live in a proper control room page.",
        },
      ],
      panelCardTitle: "What the upgraded app now signals",
      panelCardItems: [
        "A more premium visual identity.",
        "A stronger robot and space theme across the journey.",
        "A clearer bridge from landing page to real messaging.",
      ],
      panelLink: "Open settings and customize the cockpit",
      steps: [
        {
          number: "01",
          title: "Build your identity",
          copy: "Choose a bot avatar, set your username, and prepare your launch profile.",
        },
        {
          number: "02",
          title: "Tune your interface",
          copy: "Switch themes and languages from Settings whenever you want a different feel.",
        },
        {
          number: "03",
          title: "Start orbiting conversations",
          copy: "Jump into chat and send richer messages from the same responsive composer.",
        },
      ],
    },
    auth: {
      signin: {
        kicker: "Welcome back",
        title: "Return to your chats without losing momentum.",
        description:
          "KiChat keeps the flow simple: sign in, choose a conversation, and keep media, links, and voice notes moving in one place.",
        previewLabel: "Preview robot",
        previewCopy:
          "Type your username and the sign-in screen keeps a little personality while you head back in.",
        steps: [
          {
            title: "Open your account",
            copy: "Use the username and password you created during onboarding.",
          },
          {
            title: "Pick a conversation",
            copy: "Search or tap someone from the sidebar to start instantly.",
          },
          {
            title: "Send richer messages",
            copy: "Share links, images, videos, files, and recorded audio in one flow.",
          },
        ],
        cardLabel: "Sign in",
        cardTitle: "Enter KiChat",
        newHere: "New here?",
        createAccount: "Create an account",
        username: "Username",
        usernamePlaceholder: "Enter your username",
        password: "Password",
        passwordPlaceholder: "Enter your password",
        show: "Show",
        hide: "Hide",
        localNote:
          "Use the same credentials you signed up with. If an account suddenly stops working, the backend storage may have been reset and should be checked.",
        submit: "Sign in to chat",
        loading: "Signing you in...",
        invalidCredentials:
          "That username and password did not match. If this account worked recently, check the backend storage and database connection.",
        genericError: "We could not sign you in right now. Please try again.",
      },
      signup: {
        kicker: "Onboarding",
        title: "Build your identity before you say hello.",
        description:
          "Choose a robot avatar, create your username, and jump straight into chat without a clunky setup flow.",
        currentPick: "Your current pick",
        steps: [
          {
            title: "1. Pick a bot",
            copy: "Give your account a recognizable robot face.",
          },
          {
            title: "2. Lock in your handle",
            copy: "Use a username friends can search quickly.",
          },
          {
            title: "3. Start chatting",
            copy: "You'll be signed in automatically after creation.",
          },
        ],
        cardLabel: "Create account",
        cardTitle: "Choose your robot and continue",
        existingUser: "Already onboarded?",
        existingUserLink: "Sign in here",
        username: "Username",
        usernamePlaceholder: "Pick a username",
        password: "Password",
        passwordPlaceholder: "Create a strong password",
        confirmPassword: "Confirm password",
        confirmPasswordPlaceholder: "Repeat your password",
        submit: "Create account and enter chat",
        loading: "Creating your KiChat profile...",
        genericError: "Could not create your account right now. Please try again.",
      },
      validation: {
        usernameRequired: "Username is required",
        usernameLength: "Username must be at least 3 characters",
        passwordRequired: "Password is required",
        passwordLength: "Password must be at least 8 characters",
        confirmRequired: "Please confirm your password",
        passwordsMatch: "Passwords do not match",
      },
    },
    sidebar: {
      signedInAs: "Signed in as",
      directMessages: "Your direct messages",
      searchPlaceholder: "Search chats or people",
      recent: "Recent",
      recentChat: "Recent chat",
      people: "People",
      searchResults: "Search results",
      matchingContact: "Matching contact",
      availableToMessage: "Available to message",
      startConversation: "Start a conversation from the list below.",
      noMatch: "No matching users found.",
      noUsers: "No other users available yet.",
    },
    chat: {
      directMessage: "Direct message",
      selectConversation: "Select a conversation",
      selectConversationCopy: "Your media and links will stay inside KiChat.",
      online: "Online",
      signOut: "Sign out",
      settings: "Settings",
      emptyTitle: "Pick a person to start chatting",
      emptyCopy:
        "Send text, images, videos, links, voice notes, and files from one place.",
      placeholderReady: "Write a message, paste a link, or add media",
      placeholderIdle: "Choose a user to start chatting",
      browserTitle: "In-app browser",
      browserNote:
        "Some sites block embedding. If this view is blank, use the New tab button.",
      openHere: "Open here",
      newTab: "New tab",
      chooseChatRecording: "Choose a chat before recording a voice note.",
      recordingUnsupported: "Audio recording is not supported in this browser.",
      micDenied: "Microphone permission was denied.",
      recordingFailed: "Could not start voice recording.",
      recordingLabel: "Recording voice note",
      stop: "Stop",
      cancel: "Cancel",
      messageFailed: "Message could not be sent.",
      deleteMessage: "Delete message",
      deleteFailed: "Message could not be deleted.",
      fileUnavailable: "File unavailable",
      download: "Download",
      downloadVideo: "Download video",
      save: "Save",
      attachment: "Attachment",
      openInside: "Open inside KiChat",
      themeStatusDark: "Dark orbit",
      themeStatusLight: "Light orbit",
    },
    settings: {
      badge: "Control room",
      title: "Tune the interface before you push live.",
      description:
        "Choose how KiChat looks and reads across the whole app. Theme and language changes apply immediately and stay saved locally.",
      backHome: "Back home",
      backChat: "Back to chat",
      appearanceTitle: "Theme mode",
      appearanceCopy:
        "Switch the cockpit between bright glass and deep-space glass.",
      languageTitle: "Language",
      languageCopy:
        "Update key interface copy across onboarding, home, settings, and chat controls.",
      effectsTitle: "Ambient interface",
      effectsCopy:
        "The glass, stars, and orbital animations stay active to keep the app feeling alive.",
      effectsBadge: "Mirror glass active",
      effectsNote:
        "Backdrop blur, layered light, and floating motion are now part of the visual system.",
      previewTitle: "Live preview",
      previewCopy:
        "These panels respond instantly when you switch theme or language.",
      previewPrimary: "Launch conversation",
      previewSecondary: "Open robot settings",
      themes: {
        dark: {
          title: "Dark orbit",
          copy: "Deep-space glass, blue glow, and stronger nebula contrast.",
        },
        light: {
          title: "Solar glass",
          copy: "Bright mirror surfaces with warmer highlights and softer depth.",
        },
      },
      languages: {
        en: {
          title: "English",
          copy: "Default interface copy for the current build.",
        },
        sw: {
          title: "Kiswahili",
          copy: "Friendly East African localization for core screens.",
        },
        fr: {
          title: "Francais",
          copy: "A smooth alternative for a multilingual product feel.",
        },
        am: {
          title: "Amharic",
          copy: "A localized option for Ethiopian users across the main screens.",
        },
      },
    },
  },
  sw: {
    common: {
      appName: "KiChat",
      home: "Nyumbani",
      chat: "Chat",
      settings: "Mipangilio",
      signIn: "Ingia",
      signUp: "Jisajili",
      signOut: "Toka",
      openChats: "Fungua mazungumzo yangu",
      account: "Akaunti",
      guest: "Mgeni",
      dark: "Mandhari ya giza",
      light: "Mandhari ya mwanga",
      language: "Lugha",
      appearance: "Muonekano",
      saveChanges: "Imehifadhiwa moja kwa moja",
    },
    header: {
      badge: "Udhibiti wa obiti",
      tagline: "Ujumbe wa roboti wenye mwonekano wa kioo na anga",
      settings: "Mipangilio",
      launch: "Fungua chat",
      create: "Tengeneza akaunti",
    },
    footer: {
      line:
        "Imejengwa kwa mazungumzo ya roboti, media zaidi, na mwanzo ulio safi.",
      rights: "Haki zote zimehifadhiwa.",
    },
    home: {
      kicker: "Kituo cha udhibiti",
      title:
        "Anzisha kundi lako la roboti kwenye chat kwa mandhari ya anga yenye mwonekano wa sinema.",
      description:
        "KiChat sasa ina hisia ya chumba cha udhibiti chenye kioo, mandhari ya nebula inayosogea, utambulisho wa roboti, media nyingi, na njia safi ya kuingia kwenye mazungumzo.",
      primarySignedOut: "Tengeneza akaunti",
      primarySignedIn: "Fungua mazungumzo yangu",
      secondarySignedOut: "Tayari nina akaunti",
      secondarySignedIn: "Nenda moja kwa moja kwenye ujumbe",
      support: [
        "Chagua avatar ya roboti kabla hujaingia kwenye chat.",
        "Tuma maandishi, picha, video, faili, linki, na sauti iliyorekodiwa.",
        "Badili lugha na mandhari kupitia ukurasa wa Mipangilio.",
      ],
      orbitLabels: ["Sauti tayari", "Muhtasari wa linki", "Media ya nebula"],
      metrics: [
        {
          value: "Mandhari 2",
          label: "Badili kati ya giza na mwanga mara moja.",
        },
        {
          value: "Lugha 4",
          label: "Tengeneza mwonekano wa Kiingereza, Kiswahili, Francais, au Amharic.",
        },
        {
          value: "Boti 8",
          label: "Avatar za roboti zinaipa kila akaunti tabia yake.",
        },
      ],
      features: [
        {
          title: "Muonekano msikivu",
          copy: "Kadi, paneli, na vitufe sasa vinakaa vizuri zaidi kwenye simu, tablet, na desktop.",
        },
        {
          title: "Mwonekano wa kioo wa anga",
          copy: "Programu sasa ina tabaka za rangi, blur, na paneli za kioo kwa hisia ya kisasa.",
        },
        {
          title: "Sauti na media tayari",
          copy: "Picha, video, faili, sauti, na linki bado ziko kwenye composer moja.",
        },
        {
          title: "Utambulisho wa roboti",
          copy: "Usajili bado unaanza na chaguo la avatar ili kila akaunti iwe hai mapema.",
        },
        {
          title: "Mipangilio hai",
          copy: "Badili lugha na mandhari kwenye ukurasa maalum na uone mabadiliko papo hapo.",
        },
        {
          title: "Mandhari yenye mwendo",
          copy: "Nebula, obiti, na mwanga wa kioo hufanya programu isiwe tuli.",
        },
      ],
      panelKicker: "Imeundwa kama chumba cha udhibiti",
      panelTitle:
        "Waongoze watu kuingia kwenye chat kwa mwonekano bora, mwendo mzuri, na msuguano mdogo.",
      panelDescription:
        "Mwonekano mpya unatoa hisia nzuri ya kwanza bila kupoteza usomaji na utendaji kwenye vifaa vyote.",
      panelList: [
        {
          title: "Onboarding ya roboti kwanza",
          copy: "Watu wanakutana na mfumo wa avatar mapema badala ya kuchelewa.",
        },
        {
          title: "Nyuso za kioo",
          copy: "Paneli sasa zinaelea juu ya mandhari ya anga badala ya rangi tambarare.",
        },
        {
          title: "Mipangilio yenye maana",
          copy: "Mandhari na lugha sasa zina ukurasa halisi wa kudhibiti.",
        },
      ],
      panelCardTitle: "Programu iliyoboreshwa sasa inaonyesha nini",
      panelCardItems: [
        "Utambulisho wa kuona ulio wa kisasa zaidi.",
        "Mandhari thabiti ya roboti na anga kwenye safari yote.",
        "Daraja wazi kati ya ukurasa wa kwanza na mazungumzo halisi.",
      ],
      panelLink: "Fungua mipangilio na ubadilishe cockpit",
      steps: [
        {
          number: "01",
          title: "Jenga utambulisho wako",
          copy: "Chagua avatar ya boti, weka jina lako, na uandae wasifu wa uzinduzi.",
        },
        {
          number: "02",
          title: "Rekebisha interface",
          copy: "Badili mandhari na lugha kupitia Mipangilio wakati wowote.",
        },
        {
          number: "03",
          title: "Anza mazungumzo ya obiti",
          copy: "Ingia kwenye chat na utume ujumbe wenye media nyingi kutoka composer mmoja.",
        },
      ],
    },
    auth: {
      signin: {
        kicker: "Karibu tena",
        title: "Rudi kwenye mazungumzo yako bila kupoteza kasi.",
        description:
          "KiChat inaweka safari kuwa rahisi: ingia, chagua mazungumzo, na endelea na media, linki, na sauti sehemu moja.",
        previewLabel: "Boti ya mwonekano",
        previewCopy:
          "Andika jina lako na ukurasa wa kuingia unaendelea kuwa na uhai wakati unaingia tena.",
        steps: [
          {
            title: "Fungua akaunti yako",
            copy: "Tumia jina na nenosiri ulilounda wakati wa onboarding.",
          },
          {
            title: "Chagua mazungumzo",
            copy: "Tafuta au gusa mtu kwenye sidebar ili uanze haraka.",
          },
          {
            title: "Tuma ujumbe tajiri",
            copy: "Shiriki linki, picha, video, faili, na sauti iliyorekodiwa kwa mtiririko mmoja.",
          },
        ],
        cardLabel: "Ingia",
        cardTitle: "Ingia KiChat",
        newHere: "Mgeni hapa?",
        createAccount: "Tengeneza akaunti",
        username: "Jina la mtumiaji",
        usernamePlaceholder: "Weka jina lako la mtumiaji",
        password: "Nenosiri",
        passwordPlaceholder: "Weka nenosiri lako",
        show: "Onesha",
        hide: "Ficha",
        localNote:
          "Tumia taarifa zile ulizojisajili nazo. Akaunti ikiacha kufanya kazi ghafla, hifadhi ya backend au database inapaswa kuchunguzwa.",
        submit: "Ingia kwenye chat",
        loading: "Tunakuingiza...",
        invalidCredentials:
          "Jina au nenosiri halikulingana. Ikiwa akaunti hii ilifanya kazi hivi karibuni, kagua hifadhi ya backend na muunganisho wa database.",
        genericError: "Hatujaweza kukuingiza sasa hivi. Tafadhali jaribu tena.",
      },
      signup: {
        kicker: "Onboarding",
        title: "Jenga utambulisho wako kabla hujasema hello.",
        description:
          "Chagua avatar ya roboti, tengeneza jina lako, na uingie kwenye chat bila hatua ngumu.",
        currentPick: "Chaguo lako la sasa",
        steps: [
          {
            title: "1. Chagua boti",
            copy: "Ipe akaunti yako uso wa roboti unaotambulika.",
          },
          {
            title: "2. Funga jina lako",
            copy: "Tumia jina ambalo marafiki wanaweza kutafuta haraka.",
          },
          {
            title: "3. Anza chat",
            copy: "Utaingizwa moja kwa moja baada ya kuunda akaunti.",
          },
        ],
        cardLabel: "Tengeneza akaunti",
        cardTitle: "Chagua roboti yako na endelea",
        existingUser: "Ushajiunga tayari?",
        existingUserLink: "Ingia hapa",
        username: "Jina la mtumiaji",
        usernamePlaceholder: "Chagua jina la mtumiaji",
        password: "Nenosiri",
        passwordPlaceholder: "Unda nenosiri imara",
        confirmPassword: "Thibitisha nenosiri",
        confirmPasswordPlaceholder: "Rudia nenosiri lako",
        submit: "Tengeneza akaunti uingie kwenye chat",
        loading: "Tunatengeneza wasifu wako wa KiChat...",
        genericError:
          "Imeshindikana kuunda akaunti sasa hivi. Tafadhali jaribu tena.",
      },
      validation: {
        usernameRequired: "Jina la mtumiaji linahitajika",
        usernameLength: "Jina la mtumiaji liwe angalau herufi 3",
        passwordRequired: "Nenosiri linahitajika",
        passwordLength: "Nenosiri liwe angalau herufi 8",
        confirmRequired: "Tafadhali thibitisha nenosiri lako",
        passwordsMatch: "Nenosiri halifanani",
      },
    },
    sidebar: {
      signedInAs: "Umeingia kama",
      directMessages: "Ujumbe wako wa moja kwa moja",
      searchPlaceholder: "Tafuta chat au watu",
      recent: "Hivi karibuni",
      recentChat: "Chat ya karibuni",
      people: "Watu",
      searchResults: "Matokeo ya utafutaji",
      matchingContact: "Mtu anayelingana",
      availableToMessage: "Anapatikana kutumiwa ujumbe",
      startConversation: "Anza mazungumzo kutoka kwenye orodha iliyo chini.",
      noMatch: "Hakuna watumiaji waliolingana.",
      noUsers: "Hakuna watumiaji wengine kwa sasa.",
    },
    chat: {
      directMessage: "Ujumbe wa moja kwa moja",
      selectConversation: "Chagua mazungumzo",
      selectConversationCopy: "Media na linki zako zitabaki ndani ya KiChat.",
      online: "Mtandaoni",
      signOut: "Toka",
      settings: "Mipangilio",
      emptyTitle: "Chagua mtu uanze kuzungumza",
      emptyCopy:
        "Tuma maandishi, picha, video, linki, sauti, na faili kutoka sehemu moja.",
      placeholderReady: "Andika ujumbe, bandika linki, au ongeza media",
      placeholderIdle: "Chagua mtumiaji kuanza kuzungumza",
      browserTitle: "Browser ya ndani ya app",
      browserNote:
        "Baadhi ya tovuti huzuia embedding. Ikiwa view ni tupu, tumia New tab.",
      openHere: "Fungua hapa",
      newTab: "Tab mpya",
      chooseChatRecording: "Chagua chat kabla ya kurekodi sauti.",
      recordingUnsupported:
        "Kurekodi sauti hakutumiki kwenye browser hii.",
      micDenied: "Ruhusa ya microphone imekataliwa.",
      recordingFailed: "Haikuwezekana kuanza kurekodi sauti.",
      recordingLabel: "Inarekodi sauti",
      stop: "Simamisha",
      cancel: "Ghairi",
      messageFailed: "Ujumbe haukutumwa.",
      deleteMessage: "Futa ujumbe",
      deleteFailed: "Ujumbe haukufutwa.",
      fileUnavailable: "Faili haipatikani",
      download: "Pakua",
      downloadVideo: "Pakua video",
      save: "Hifadhi",
      attachment: "Kiambatisho",
      openInside: "Fungua ndani ya KiChat",
      themeStatusDark: "Obiti ya giza",
      themeStatusLight: "Obiti ya mwanga",
    },
    settings: {
      badge: "Chumba cha udhibiti",
      title: "Rekebisha interface kabla hujasukuma live.",
      description:
        "Chagua jinsi KiChat inavyoonekana na kusomeka kwenye app nzima. Mandhari na lugha huhifadhiwa papo hapo.",
      backHome: "Rudi nyumbani",
      backChat: "Rudi kwenye chat",
      appearanceTitle: "Aina ya mandhari",
      appearanceCopy:
        "Badili cockpit kati ya kioo cha mwanga na kioo cha anga ya giza.",
      languageTitle: "Lugha",
      languageCopy:
        "Badili maandishi muhimu kwenye onboarding, home, settings, na chat controls.",
      effectsTitle: "Mandhari hai",
      effectsCopy:
        "Kioo, nyota, na mizunguko ya obiti vinaendelea kuwaka ili app ihisi hai.",
      effectsBadge: "Mirror glass iko active",
      effectsNote:
        "Backdrop blur, tabaka za mwanga, na mwendo wa kuelea sasa ni sehemu ya mfumo wa kuona.",
      previewTitle: "Muhtasari wa moja kwa moja",
      previewCopy:
        "Paneli hizi hubadilika papo hapo unapobadili lugha au mandhari.",
      previewPrimary: "Anzisha mazungumzo",
      previewSecondary: "Fungua mipangilio ya roboti",
      themes: {
        dark: {
          title: "Obiti ya giza",
          copy: "Kioo cha anga ya giza, mwanga wa buluu, na nebula yenye contrast kubwa.",
        },
        light: {
          title: "Kioo cha jua",
          copy: "Nyuso nyepesi za mirror zenye mwanga wa joto na kina laini.",
        },
      },
      languages: {
        en: {
          title: "English",
          copy: "Nakala ya msingi ya sasa ya interface.",
        },
        sw: {
          title: "Kiswahili",
          copy: "Utafsiri rafiki wa Afrika Mashariki kwa skrini kuu.",
        },
        fr: {
          title: "Francais",
          copy: "Chaguo laini kwa hisia ya bidhaa ya lugha nyingi.",
        },
        am: {
          title: "Amharic",
          copy: "Chaguo la Kiamhari kwa watumiaji wa Ethiopia kwenye skrini kuu.",
        },
      },
    },
  },
  fr: {
    common: {
      appName: "KiChat",
      home: "Accueil",
      chat: "Chat",
      settings: "Parametres",
      signIn: "Connexion",
      signUp: "Inscription",
      signOut: "Deconnexion",
      openChats: "Ouvrir mes chats",
      account: "Compte",
      guest: "Invite",
      dark: "Mode sombre",
      light: "Mode clair",
      language: "Langue",
      appearance: "Apparence",
      saveChanges: "Enregistre instantanement",
    },
    header: {
      badge: "Controle orbital",
      tagline: "Messagerie robotique avec verre spatial et ambiance premium",
      settings: "Parametres",
      launch: "Ouvrir le chat",
      create: "Creer un compte",
    },
    footer: {
      line:
        "Concu pour des conversations robotiques, plus de media, et un meilleur demarrage.",
      rights: "Tous droits reserves.",
    },
    home: {
      kicker: "Centre de controle",
      title:
        "Lancez votre equipage robotique dans un chat plus spatial et plus vivant.",
      description:
        "KiChat adopte maintenant une ambiance de cockpit en verre avec fond nebuleux anime, identite robotique, media riches, et un chemin plus net vers la conversation.",
      primarySignedOut: "Creer votre compte",
      primarySignedIn: "Ouvrir mes chats",
      secondarySignedOut: "J'ai deja un compte",
      secondarySignedIn: "Aller directement a la messagerie",
      support: [
        "Choisissez un avatar robot avant d'entrer dans le chat.",
        "Envoyez texte, images, videos, fichiers, liens, et audio enregistre.",
        "Reglez langue et theme depuis la page Parametres.",
      ],
      orbitLabels: ["Pret pour la voix", "Apercu des liens", "Media nebuleux"],
      metrics: [
        {
          value: "2 themes",
          label: "Passez du mode clair au mode sombre instantanement.",
        },
        {
          value: "4 langues",
          label: "Utilisez English, Kiswahili, Francais, ou Amharic pour l'interface.",
        },
        {
          value: "8 bots",
          label: "Les avatars robots donnent une vraie personnalite a chaque compte.",
        },
      ],
      features: [
        {
          title: "Responsive partout",
          copy: "Les cartes, panneaux, et controles s'adaptent mieux sur mobile, tablette, et desktop.",
        },
        {
          title: "Verre spatial",
          copy: "L'application utilise maintenant des couches, du flou, et des surfaces translucides plus premium.",
        },
        {
          title: "Media et voix prets",
          copy: "Images, videos, fichiers, voix, et liens restent dans le meme composeur.",
        },
        {
          title: "Identite robotique",
          copy: "L'inscription commence toujours par le choix d'avatar pour donner du caractere des le debut.",
        },
        {
          title: "Parametres vivants",
          copy: "Changez langue et theme depuis une vraie page de controle et voyez la mise a jour immediatement.",
        },
        {
          title: "Ambiance animee",
          copy: "Nebules, orbites, et reflets rendent l'application moins statique.",
        },
      ],
      panelKicker: "Pense comme un cockpit",
      panelTitle:
        "Guidez les gens vers le chat avec plus de clarte visuelle et moins de friction.",
      panelDescription:
        "Le flux rafraichi donne une premiere impression plus forte tout en restant lisible et responsive.",
      panelList: [
        {
          title: "Onboarding robot d'abord",
          copy: "Les gens rencontrent le systeme d'avatar tout de suite.",
        },
        {
          title: "Surfaces en verre",
          copy: "Les panneaux flottent maintenant sur des fonds spatiaux au lieu de blocs plats.",
        },
        {
          title: "Parametres utiles",
          copy: "Le theme et la langue ont maintenant une vraie salle de controle.",
        },
      ],
      panelCardTitle:
        "Ce que l'application amelioree communique maintenant",
      panelCardItems: [
        "Une identite visuelle plus premium.",
        "Un theme robot et espace plus coherent.",
        "Un lien plus clair entre accueil et vraie conversation.",
      ],
      panelLink: "Ouvrir les parametres et personnaliser le cockpit",
      steps: [
        {
          number: "01",
          title: "Construisez votre identite",
          copy: "Choisissez un avatar bot, fixez votre pseudo, et preparez votre profil de lancement.",
        },
        {
          number: "02",
          title: "Reglez votre interface",
          copy: "Changez theme et langue depuis Parametres quand vous voulez.",
        },
        {
          number: "03",
          title: "Entrez en conversation",
          copy: "Passez au chat et envoyez des messages plus riches depuis le meme composeur.",
        },
      ],
    },
    auth: {
      signin: {
        kicker: "Bon retour",
        title: "Revenez dans vos conversations sans casser le rythme.",
        description:
          "KiChat garde le flux simple: connexion, choix d'une conversation, puis liens, media, et notes vocales au meme endroit.",
        previewLabel: "Robot apercu",
        previewCopy:
          "Tapez votre pseudo et l'ecran de connexion garde une touche de personnalite.",
        steps: [
          {
            title: "Ouvrez votre compte",
            copy: "Utilisez le pseudo et le mot de passe crees pendant l'onboarding.",
          },
          {
            title: "Choisissez une conversation",
            copy: "Cherchez ou touchez une personne dans la barre laterale pour commencer vite.",
          },
          {
            title: "Envoyez plus riche",
            copy: "Partagez liens, images, videos, fichiers, et audio en un seul flux.",
          },
        ],
        cardLabel: "Connexion",
        cardTitle: "Entrer dans KiChat",
        newHere: "Nouveau ici ?",
        createAccount: "Creer un compte",
        username: "Pseudo",
        usernamePlaceholder: "Entrez votre pseudo",
        password: "Mot de passe",
        passwordPlaceholder: "Entrez votre mot de passe",
        show: "Voir",
        hide: "Masquer",
        localNote:
          "Utilisez les memes identifiants qu'a l'inscription. Si un compte cesse soudainement de marcher, verifiez le stockage backend et la base de donnees.",
        submit: "Se connecter au chat",
        loading: "Connexion en cours...",
        invalidCredentials:
          "Le pseudo et le mot de passe ne correspondent pas. Si ce compte marchait recemment, verifiez le stockage backend et la connexion a la base.",
        genericError: "Connexion impossible pour le moment. Reessayez.",
      },
      signup: {
        kicker: "Onboarding",
        title: "Construisez votre identite avant de dire bonjour.",
        description:
          "Choisissez un avatar robot, creez votre pseudo, et entrez dans le chat sans flux maladroit.",
        currentPick: "Votre choix actuel",
        steps: [
          {
            title: "1. Choisir un bot",
            copy: "Donnez a votre compte un visage robot reconnaissable.",
          },
          {
            title: "2. Fixer votre pseudo",
            copy: "Utilisez un pseudo facile a trouver pour vos amis.",
          },
          {
            title: "3. Commencer le chat",
            copy: "Vous serez connecte automatiquement apres la creation.",
          },
        ],
        cardLabel: "Creer un compte",
        cardTitle: "Choisissez votre robot et continuez",
        existingUser: "Deja inscrit ?",
        existingUserLink: "Connectez-vous ici",
        username: "Pseudo",
        usernamePlaceholder: "Choisissez un pseudo",
        password: "Mot de passe",
        passwordPlaceholder: "Creez un mot de passe solide",
        confirmPassword: "Confirmer le mot de passe",
        confirmPasswordPlaceholder: "Repetez votre mot de passe",
        submit: "Creer le compte et entrer dans le chat",
        loading: "Creation de votre profil KiChat...",
        genericError: "Impossible de creer votre compte maintenant. Reessayez.",
      },
      validation: {
        usernameRequired: "Le pseudo est requis",
        usernameLength: "Le pseudo doit avoir au moins 3 caracteres",
        passwordRequired: "Le mot de passe est requis",
        passwordLength: "Le mot de passe doit avoir au moins 8 caracteres",
        confirmRequired: "Veuillez confirmer votre mot de passe",
        passwordsMatch: "Les mots de passe ne correspondent pas",
      },
    },
    sidebar: {
      signedInAs: "Connecte en tant que",
      directMessages: "Vos messages directs",
      searchPlaceholder: "Rechercher chats ou personnes",
      recent: "Recents",
      recentChat: "Chat recent",
      people: "Personnes",
      searchResults: "Resultats de recherche",
      matchingContact: "Contact correspondant",
      availableToMessage: "Disponible pour un message",
      startConversation:
        "Commencez une conversation depuis la liste ci-dessous.",
      noMatch: "Aucun utilisateur correspondant.",
      noUsers: "Aucun autre utilisateur disponible pour le moment.",
    },
    chat: {
      directMessage: "Message direct",
      selectConversation: "Choisissez une conversation",
      selectConversationCopy: "Vos media et liens resteront dans KiChat.",
      online: "En ligne",
      signOut: "Deconnexion",
      settings: "Parametres",
      emptyTitle: "Choisissez une personne pour commencer",
      emptyCopy:
        "Envoyez texte, images, videos, liens, notes vocales, et fichiers depuis un seul endroit.",
      placeholderReady: "Ecrire un message, coller un lien, ou ajouter un media",
      placeholderIdle: "Choisissez un utilisateur pour commencer",
      browserTitle: "Navigateur integre",
      browserNote:
        "Certains sites bloquent l'integration. Si la vue est vide, utilisez le bouton nouvel onglet.",
      openHere: "Ouvrir ici",
      newTab: "Nouvel onglet",
      chooseChatRecording:
        "Choisissez un chat avant d'enregistrer une note vocale.",
      recordingUnsupported:
        "L'enregistrement audio n'est pas pris en charge dans ce navigateur.",
      micDenied: "L'autorisation du micro a ete refusee.",
      recordingFailed: "Impossible de demarrer l'enregistrement.",
      recordingLabel: "Enregistrement vocal",
      stop: "Arreter",
      cancel: "Annuler",
      messageFailed: "Le message n'a pas pu etre envoye.",
      deleteMessage: "Supprimer le message",
      deleteFailed: "Le message n'a pas pu etre supprime.",
      fileUnavailable: "Fichier indisponible",
      download: "Telecharger",
      downloadVideo: "Telecharger la video",
      save: "Enregistrer",
      attachment: "Piece jointe",
      openInside: "Ouvrir dans KiChat",
      themeStatusDark: "Orbite sombre",
      themeStatusLight: "Orbite claire",
    },
    settings: {
      badge: "Salle de controle",
      title: "Reglez l'interface avant de pousser en production.",
      description:
        "Choisissez l'apparence et la langue de KiChat sur toute l'application. Les changements sont immediats et sauvegardes localement.",
      backHome: "Retour accueil",
      backChat: "Retour au chat",
      appearanceTitle: "Mode de theme",
      appearanceCopy: "Passez du verre lumineux au verre spatial profond.",
      languageTitle: "Langue",
      languageCopy:
        "Mettez a jour les textes cles sur l'accueil, l'onboarding, les parametres, et les controles du chat.",
      effectsTitle: "Interface ambiante",
      effectsCopy:
        "Le verre, les etoiles, et les animations orbitales restent actifs pour garder l'application vivante.",
      effectsBadge: "Mirror glass actif",
      effectsNote:
        "Le flou d'arriere-plan, la lumiere en couches, et le mouvement flottant font maintenant partie du systeme visuel.",
      previewTitle: "Apercu en direct",
      previewCopy:
        "Ces panneaux reagissent immediatement quand vous changez le theme ou la langue.",
      previewPrimary: "Lancer une conversation",
      previewSecondary: "Ouvrir les reglages robot",
      themes: {
        dark: {
          title: "Orbite sombre",
          copy: "Verre spatial profond, halo bleu, et contraste nebuleux plus fort.",
        },
        light: {
          title: "Verre solaire",
          copy: "Surfaces claires et miroir avec des points lumineux plus doux.",
        },
      },
      languages: {
        en: {
          title: "English",
          copy: "Texte par defaut pour la version actuelle.",
        },
        sw: {
          title: "Kiswahili",
          copy: "Localisation est-africaine conviviale pour les ecrans cles.",
        },
        fr: {
          title: "Francais",
          copy: "Une option douce pour une sensation plus multilingue.",
        },
        am: {
          title: "Amharic",
          copy: "Une option amharique pour les ecrans principaux.",
        },
      },
    },
  },
};

APP_COPY.am = {
  ...APP_COPY.en,
  common: {
    ...APP_COPY.en.common,
    home: "መነሻ",
    settings: "ቅንብሮች",
    signIn: "ግባ",
    signUp: "ተመዝገብ",
    signOut: "ውጣ",
    openChats: "ውይይቶቼን ክፈት",
    account: "መለያ",
    guest: "እንግዳ",
    dark: "ጨለማ ገጽታ",
    light: "ብርሃን ገጽታ",
    language: "ቋንቋ",
    appearance: "መልክ",
    saveChanges: "ወዲያውኑ ተቀምጧል",
  },
  header: {
    ...APP_COPY.en.header,
    badge: "መቆጣጠሪያ",
    tagline: "ዘመናዊ ቻት ከተሻለ ሮቦት መለያ ጋር",
    settings: "ቅንብሮች",
    launch: "ቻት ክፈት",
    create: "መለያ ፍጠር",
  },
  footer: {
    line: "ቀላል መግቢያ፣ ግልጽ UI፣ እና ዘመናዊ የቻት ተሞክሮ።",
    rights: "መብቶቹ በሙሉ የተጠበቁ ናቸው።",
  },
  home: {
    ...APP_COPY.en.home,
    kicker: "የውይይት ማዕከል",
    title: "ፈጣን፣ ቀላል እና ዘመናዊ ቻት መነሻ።",
    description: "ከአነስተኛ ጽሑፍ፣ ተንቀሳቃሽ ካርዶች፣ እና ተሻለ መልክ ጋር ወዲያውኑ ወደ ውይይት ይግቡ።",
    primarySignedOut: "አሁን ጀምር",
    primarySignedIn: "ውይይቶቼን ክፈት",
    secondarySignedOut: "አስቀድሜ መለያ አለኝ",
    secondarySignedIn: "በቀጥታ ወደ ቻት ሂድ",
    support: [
      "በስልክ፣ ታብሌት፣ እና ዴስክቶፕ ላይ በደንብ ይሰራል።",
      "ጽሑፍ፣ ፋይል፣ ምስል እና አገናኝ ከአንድ ቦታ ይላኩ።",
      "ቋንቋን እና ገጽታን በቅንብሮች ይቀይሩ።",
    ],
    orbitLabels: ["ፈጣን", "ንጹህ UI", "ተለስላሽ ቻት"],
    metrics: [
      {
        value: "2 ገጽታዎች",
        label: "ብርሃን እና ጨለማ መልክን በፍጥነት ይቀይሩ።",
      },
      {
        value: "4 ቋንቋዎች",
        label: "English, Kiswahili, Francais, እና አማርኛን ይጠቀሙ።",
      },
      {
        value: "8 አቫታሮች",
        label: "ለእያንዳንዱ መለያ የተሻለ ሮቦት መልክ።",
      },
    ],
    features: [
      {
        title: "በሁሉም መሣሪያዎች የሚሰራ",
        copy: "ስክሪኑ ሲቀየርም አቀማመጡ የተስተካከለ ይቆያል።",
      },
      {
        title: "ዘመናዊ የቻት ቅርጽ",
        copy: "ንጹህ ፓነሎች፣ ተንቀሳቃሽ ንጥሎች፣ እና ግልጽ የእርምጃ አዝራሮች።",
      },
      {
        title: "ሚዲያ ዝግጁ",
        copy: "ምስሎች፣ ፋይሎች፣ አገናኞች እና ድምጽ ማስታወሻዎች ከአንድ ቦታ ውስጥ።",
      },
    ],
  },
  auth: {
    ...APP_COPY.en.auth,
    signin: {
      ...APP_COPY.en.auth.signin,
      kicker: "እንኳን ደህና መጡ",
      title: "ወደ ውይይቶችዎ ይመለሱ።",
      description: "ግባ፣ ሰው ምረጥ፣ እና ውይይትህን ቀጥል።",
      previewLabel: "የአቫታር ቅድሚያ እይታ",
      previewCopy: "የተሻለ ሮቦት መልክ ከመግባትህ በፊት ይታያል።",
      cardLabel: "ግባ",
      cardTitle: "KiChat ግባ",
      newHere: "አዲስ ነህ?",
      createAccount: "መለያ ፍጠር",
      username: "የተጠቃሚ ስም",
      usernamePlaceholder: "የተጠቃሚ ስምህን አስገባ",
      password: "የይለፍ ቃል",
      passwordPlaceholder: "የይለፍ ቃልህን አስገባ",
      show: "አሳይ",
      hide: "ደብቅ",
      localNote: "በመመዝገብ ጊዜ የተጠቀምክበትን መረጃ ተጠቀም።",
      submit: "ግባ",
      loading: "በመግባት ላይ...",
      invalidCredentials: "የተጠቃሚ ስም ወይም የይለፍ ቃል ትክክል አይደለም።",
      genericError: "አሁን መግባት አልተቻለም።",
    },
    signup: {
      ...APP_COPY.en.auth.signup,
      kicker: "መጀመሪያ",
      title: "ከሰላምታ በፊት መለያህን አዘጋጅ።",
      description: "አቫታር ምረጥ፣ የተጠቃሚ ስም ፍጠር፣ እና በቀጥታ ወደ ቻት ግባ።",
      currentPick: "አሁን የመረጥከው",
      cardLabel: "መለያ ፍጠር",
      cardTitle: "አቫታርህን ምረጥ እና ቀጥል",
      existingUser: "መለያ አለህ?",
      existingUserLink: "ከዚህ ግባ",
      username: "የተጠቃሚ ስም",
      usernamePlaceholder: "የተጠቃሚ ስም ምረጥ",
      password: "የይለፍ ቃል",
      passwordPlaceholder: "ጠንካራ የይለፍ ቃል ፍጠር",
      confirmPassword: "የይለፍ ቃልን አረጋግጥ",
      confirmPasswordPlaceholder: "የይለፍ ቃልህን ድገም",
      submit: "መለያ ፍጠር",
      loading: "መለያ በመፍጠር ላይ...",
      genericError: "መለያ መፍጠር አልተቻለም።",
    },
    validation: {
      usernameRequired: "የተጠቃሚ ስም ያስፈልጋል",
      usernameLength: "የተጠቃሚ ስም ቢያንስ 3 ፊደል መሆን አለበት",
      passwordRequired: "የይለፍ ቃል ያስፈልጋል",
      passwordLength: "የይለፍ ቃል ቢያንስ 8 ፊደል መሆን አለበት",
      confirmRequired: "የይለፍ ቃልህን አረጋግጥ",
      passwordsMatch: "የይለፍ ቃሎቹ አይመሳሰሉም",
    },
  },
  sidebar: {
    ...APP_COPY.en.sidebar,
    signedInAs: "እንደዚህ ገብተሃል",
    directMessages: "የግል ውይይቶች",
    searchPlaceholder: "ሰዎችን ወይም ቻቶችን ፈልግ",
    recent: "የቅርብ ጊዜ",
    recentChat: "የቅርብ ውይይት",
    people: "ሰዎች",
    searchResults: "የፍለጋ ውጤቶች",
    matchingContact: "ተመሳሳይ ውጤት",
    availableToMessage: "መልዕክት ለመላክ ዝግጁ",
    startConversation: "ከታች ካሉት ሰዎች ጋር ውይይት ጀምር።",
    noMatch: "ተመሳሳይ ተጠቃሚ አልተገኘም።",
    noUsers: "ሌሎች ተጠቃሚዎች አልተገኙም።",
  },
  chat: {
    ...APP_COPY.en.chat,
    directMessage: "የግል መልዕክት",
    selectConversation: "ውይይት ምረጥ",
    selectConversationCopy: "መልዕክቶችህ በKiChat ውስጥ ይቀመጣሉ።",
    online: "መስመር ላይ",
    signOut: "ውጣ",
    settings: "ቅንብሮች",
    emptyTitle: "ለመጀመር ሰው ምረጥ",
    emptyCopy: "ጽሑፍ፣ ምስል፣ አገናኝ፣ ፋይል እና ድምጽ ከአንድ ቦታ ላክ።",
    placeholderReady: "መልዕክት ጻፍ ወይም አገናኝ አክል",
    placeholderIdle: "ለመጀመር ተጠቃሚ ምረጥ",
    browserTitle: "ውስጣዊ አሳሽ",
    browserNote: "አንዳንድ ድረ ገፆች ውስጥ መክፈትን ይከለክላሉ።",
    openHere: "እዚህ ክፈት",
    newTab: "አዲስ ታብ",
    chooseChatRecording: "ከመቅረጽ በፊት ውይይት ምረጥ።",
    recordingUnsupported: "ድምጽ መቅረጽ በዚህ አሳሽ አይደገፍም።",
    micDenied: "የማይክሮፎን ፍቃድ ተከልክሏል።",
    recordingFailed: "ድምጽ መቅረጽ መጀመር አልተቻለም።",
    recordingLabel: "ድምጽ በመቅረጽ ላይ",
    stop: "አቁም",
    cancel: "ሰርዝ",
    messageFailed: "መልዕክቱ አልተላከም።",
    deleteMessage: "መልዕክት ሰርዝ",
    deleteFailed: "መልዕክቱን መሰረዝ አልተቻለም።",
    fileUnavailable: "ፋይሉ አይገኝም",
    download: "አውርድ",
    downloadVideo: "ቪዲዮ አውርድ",
    save: "አስቀምጥ",
    attachment: "አባሪ",
    openInside: "በKiChat ውስጥ ክፈት",
    themeStatusDark: "ጨለማ ሁኔታ",
    themeStatusLight: "ብርሃን ሁኔታ",
  },
  settings: {
    ...APP_COPY.en.settings,
    badge: "መቆጣጠሪያ ክፍል",
    title: "UI-ውን ከመግባት በፊት አስተካክል።",
    description: "የKiChat መልክን እና ቋንቋን በመላ መተግበሪያው ላይ ቀይር።",
    backHome: "ወደ መነሻ ተመለስ",
    backChat: "ወደ ቻት ተመለስ",
    appearanceTitle: "ገጽታ",
    appearanceCopy: "ብርሃን እና ጨለማ መልክ መካከል ቀይር።",
    languageTitle: "ቋንቋ",
    languageCopy: "በመነሻ፣ በመግቢያ፣ በቅንብሮች፣ እና በቻት ላይ ያሉ ጽሑፎችን ቀይር።",
    effectsTitle: "እንቅስቃሴ",
    effectsCopy: "ቀላል እንቅስቃሴ እና ብርሃን በመተግበሪያው ውስጥ ይቀጥላሉ።",
    effectsBadge: "ተጽእኖዎች ንቁ ናቸው",
    effectsNote: "ብርሃን፣ ቀለማት፣ እና ቀላል እንቅስቃሴ የአዲሱ ቅርጽ ክፍል ናቸው።",
    previewTitle: "የቀጥታ ቅድሚያ እይታ",
    previewCopy: "ገጽታን ወይም ቋንቋን ሲቀይሩ እነዚህ ፓነሎች ወዲያውኑ ይቀየራሉ።",
    previewPrimary: "ውይይት ጀምር",
    previewSecondary: "የሮቦት ቅንብሮችን ክፈት",
    themes: {
      dark: {
        title: "ጨለማ መልክ",
        copy: "ጥልቅ ቀለም እና ግልጽ ኮንትራስት ያለው እይታ።",
      },
      light: {
        title: "ብርሃን መልክ",
        copy: "ንጹህ እና ቀላል ብርሃን ያለው ቅርጽ።",
      },
    },
    languages: {
      ...APP_COPY.en.settings.languages,
      am: {
        title: "አማርኛ",
        copy: "ለዋና ስክሪኖች የአማርኛ ትርጉም።",
      },
    },
  },
};
