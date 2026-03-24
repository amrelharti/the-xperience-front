"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { CheckCircle2, ArrowRight, ArrowDown, PlayCircle, Users, Target, FileText, Linkedin, MessageSquare, Calendar, ChevronDown, Instagram, Award, TrendingUp, Clock, Sparkles, Menu, X, Star, Quote, FileCheck, ChevronLeft, ChevronRight } from "lucide-react"

type Language = "en" | "fr"

interface Content {
  header: {
    logo: string
    nav: {
      program: string
      forWho: string
      price: string
      faq: string
    }
  }
  hero: {
    headline: string
    subheading: string
    forWho: string
    ctaPrimary: string
    ctaSecondary: string
  }
  socialProof: {
    title: string
    stats: {
      number: string
      label: string
    }[]
  }
  problem: {
    title: string
    subtitle?: string
    emotional?: string
    positioning?: string
    reasons: {
      number: string
      title: string
      description: string
    }[]
  }
  solution: {
    title: string
    subtitle: string
    points: string[]
  }
  cvScorer: {
    title: string
    subtitle: string
    description: string
    features: string[]
    cta: string
    ctaSecondary: string
  }
  trainer: {
    title: string
    name: string
    role: string
    image: string
    bio: string[]
    stats: {
      label: string
      value: string
    }[]
    social: {
      instagram: string
      linkedin: string
    }
  }
  transformation: {
    title: string
    points: string[]
  }
  modules: {
    title: string
    items: {
      title: string
      description: string
    }[]
  }
  platform: {
    title: string
    subtitle?: string
    points: string[]
  }
  whoItsFor: {
    title: string
    points: string[]
  }
  price: {
    title: string
    plans: {
      basic: {
        name: string
        originalPrice: string
        currentPrice: string
        description?: string
        features: string[]
      }
      premium: {
        name: string
        originalPrice: string
        currentPrice: string
        specialOffer: string
        description?: string
        features: string[]
      }
    }
  }
  faq: {
    title: string
    items: {
      question: string
      answer: string
    }[]
  }
  testimonials: {
    title: string
    items: {
      name: string
      role: string
      text: string
      rating: number
      image: string
    }[]
  }
  struggle: {
    paragraphs: string[]
    conclusion: string
  }
  form: {
    title: string
    subtitle: string
    fields: {
      fullName: string
      phone: string
      lookingFor: string
      offer: string
      submit: string
    }
    lookingForOptions: {
      stagePFE: string
      premierEmploi: string
      progresserCarriere: string
      reconversion: string
    }
    offerOptions: {
      xperiencePro: string
      xperience: string
    }
  }
}

const content: Record<Language, Content> = {
  en: {
    header: {
      logo: "Xperience Pro",
      nav: {
        program: "Program",
        forWho: "For Who?",
        price: "Price",
        faq: "FAQ",
      },
    },
    hero: {
      headline: "Ignored by recruiters?\n Put an end to applications without response.",
      subheading: "You send applications. You make efforts. But responses don't come. And you don't know why.",
      forWho: "For candidates who want to understand what's blocking them and how to fix it.",
      ctaPrimary: "Fix My Job Search Now",
      ctaSecondary: "See How It Works",
    },
    socialProof: {
      title: "Proven Method",
      stats: [
        { number: "+6000", label: "candidates accompanied" },
        { number: "92%", label: "reached their professional goals" },
        { number: "80%", label: "did it in less than 3 months" },
      ],
    },
    problem: {
      title: "3 reasons why you don't reach your professional goals",
      reasons: [
        {
          number: "01",
          title: "You don't use the right tools (including AI) to adapt your CV to job offers",
          description: "Generic CV with no keywords, not attractive to recruiters.",
        },
        {
          number: "02",
          title: "You don't know how to handle interviews like a pro",
          description: "Your answers are not structured and not convincing.",
        },
        {
          number: "03",
          title: "You don't prepare in advance to seize opportunities",
          description: "Great opportunities pass by and you end up accepting a job you don't really want.",
        },
      ],
    },
    solution: {
      title: "Xperience Pro: The Complete Solution",
      subtitle: "Xperience Pro is a structured 4 weeks program, designed for candidates who want to:",
      points: [
        "Identify why their applications don't lead to results",
        "Fix what's really blocking them from the recruiter's perspective",
        "Stop applying blindly",
      ],
    },
    cvScorer: {
      title: "Try Our Free CV Scorer",
      subtitle: "Get instant feedback on your CV",
      description: "Upload your CV and get a detailed analysis with scores on structure, content quality, relevance, professionalism, and ATS compatibility. Get personalized feedback to improve your CV before applying.",
      features: [
        "AI-powered CV analysis in seconds",
        "5-dimension scoring system",
        "Personalized improvement suggestions",
        "ATS compatibility check",
        "Match your CV to job descriptions",
      ],
      cta: "Score My CV Now",
      ctaSecondary: "Learn More",
    },
    trainer: {
      title: "Meet your coach",
      name: "Ali El Harti",
      role: "Certified Trainer & Employability Manager",
      image: "/ali.jpg", // Trainer image located in /public/ali.jpg
      bio: [
        "Certified trainer with 7+ years of experience helping young people prepare for the job market.",
        "Specializes in job and internship search techniques.",
        "More than 6000 people have benefited from his consultation.",
        "Has spoken in over 100 conferences and workshops in Morocco and internationally.",
        "Works as an Employability Manager and collaborates with several well-known universities in Morocco, focusing on company relations and industrial partnerships.",
        "Has been invited by major media such as Al Aoula, Le Matin, and M24.",
      ],
      stats: [
        { label: "Years of Experience", value: "7+" },
        { label: "People Coached", value: "6000+" },
        { label: "Conferences & Workshops", value: "100+" },
      ],
      social: {
        instagram: "https://www.instagram.com/alielharti_ma/", // TODO: Update with actual Instagram URL
        linkedin: "https://linkedin.com/in/ali-el-harti", // TODO: Update with actual LinkedIn URL
      },
    },
    transformation: {
      title: "What you'll be able to do after Xperience Pro",
      points: [
        "Create a clear, professional CV that recruiters actually want to read.",
        "Quickly adapt your CV to each job without starting from scratch.",
        "Have a clean, attractive LinkedIn profile that works for you.",
        "Arrive to interviews prepared, with clear answers and smart questions.",
      ],
    },
    modules: {
      title: "What's inside Xperience Pro",
      items: [
        {
          title: "Module 1 : Clear, readable CV understood by recruiters",
          description: "Optimize your CV so that it is :\n• Quickly understandable\n• Aligned with recruiters' expectations\nObjective : Pass the first screening and avoid automatic elimination.",
        },
        {
          title: "Module 2 : Mastering interview techniques",
          description: "Understand :\n• What the recruiter is really looking to evaluate\n• How to avoid vague or off-topic answers\nObjective : Perform better in interviews, without improvising.",
        },
        {
          title: "Module 3 : Managing stress and convincing in interviews",
          description: "Learn to :\n• Manage stress before and during the interview\n• Research the company well and stand out\nObjective : Gain confidence and impact with the recruiter.",
        },
        {
          title: "Module 4 : LinkedIn and professional positioning",
          description: "Optimize your presence on LinkedIn to :\n• Strengthen your credibility with recruiters\n• Position yourself as a thought leader in your field.\nObjective : Improve your visibility and positioning in the market.",
        },
      ],
    },
    platform: {
      title: "Xperience Pro: A Unique solution",
      subtitle: "Understanding alone isn't enough. Applying alone is difficult.",
      points: [
        "Clear video capsules, accessible at any time, to understand the real rules of recruitment and what recruiters really expect.",
        "A 4 weeks structure with live sessions, concrete exercises, and guided practice boosted by AI.",
        "With Xperience: you get real feedback, you know exactly what to fix, you move forward with a clear framework.",
        "Important: Videos remain accessible even after the program ends.",
      ],
    },
    whoItsFor: {
      title: "Xperience Pro is for you if…",
      points: [
        "You're a student, employee, or job seeker.",
        "You're tired of sending applications and hearing nothing back.",
        "You want a clear structure instead of random YouTube videos.",
      ],
    },
    price: {
      title: "Choose Your Plan",
      plans: {
        basic: {
          name: "COACHING BASIC",
          originalPrice: "1000 DH",
          currentPrice: "800 DH",
          description: "A first step to test our program",
          features: [
            "The Basic Coaching gives access to one module of the program, your choice:",
            "Professional CV",
            "Interview techniques",
            "Personal branding and LinkedIn",
          ],
        },
        premium: {
          name: "COACHING PREMIUM",
          originalPrice: "1800 DH",
          currentPrice: "1200 DH",
          specialOffer: "RECOMMENDED",
          description: "Will help you correct all the key points that influence the recruiter's decision.",
          features: [
            "CV",
            "Clear, readable and quickly understandable CV",
            "Capable of passing the first screening",
            "Interviews",
            "Structured and relevant answers",
            "Better understanding of what the recruiter really expects",
            "LinkedIn",
            "Profile optimization",
            "Content creation strategy",
            "Support & follow-up",
            "Personalized live feedback and on WhatsApp",
            "Resources and application exercises",
          ],
        },
      },
    },
    faq: {
      title: "Frequently Asked Questions",
      items: [
        {
          question: "How do I access the program after payment?",
          answer: "Once the payment is made, you send us the bank receipt via WhatsApp. After completing the Onboarding form, we give you access to the Xperience platform with the video capsules and the WhatsApp group of the community",
        },
        {
          question: "Is it suitable for beginners?",
          answer: "Our clients are students, fresh graduates and employees. Xperience is suitable for any competent candidate who wants to end applications without responses and boost their professional career.",
        },
        {
          question: "How long do I keep access?",
          answer: "You have lifetime access to all the video capsules. Once you join, you can review the lessons whenever you want, wherever you want.",
        },
        {
          question: "Can I access it on mobile?",
          answer: "Yes! The platform is fully responsive and works perfectly on your phone, tablet, or computer.",
        },
      ],
    },
    testimonials: {
      title: "What our students say",
      items: [
        {
          name: "Sarah M.",
          role: "Recent Graduate",
          text: "Xperience Pro completely transformed my job search. I went from zero responses to multiple interviews in just 2 months. The CV adaptation techniques are game-changers!",
          rating: 5,
          image: "/public/ali.jpg", // TODO: Replace with actual testimonial images
        },
        {
          name: "Ahmed K.",
          role: "Career Changer",
          text: "I was stuck in a job I didn't like. This program gave me the confidence and tools to make a successful career transition. The interview preparation module is excellent.",
          rating: 5,
          image: "/placeholder-user.jpg", // TODO: Replace with actual testimonial images
        },
        {
          name: "Fatima L.",
          role: "Student",
          text: "As a student with no experience, I thought finding an internship would be impossible. Xperience Pro showed me how to highlight my skills and I got 3 internship offers!",
          rating: 5,
          image: "/placeholder-user.jpg", // TODO: Replace with actual testimonial images
        },
        {
          name: "Youssef B.",
          role: "Job Seeker",
          text: "The LinkedIn optimization tips alone are worth the investment. I started getting messages from recruiters within weeks. Highly recommend!",
          rating: 5,
          image: "/placeholder-user.jpg", // TODO: Replace with actual testimonial images
        },
      ],
    },
    struggle: {
      paragraphs: [
        "You apply without responses.",
        "You sometimes go to interviews, with no follow-up.",
        "You improve your CV, with no real impact.",
        "👉 The hardest part isn't the rejection. It's not knowing what to fix.",
        "",
        "You see others moving forward.",
        "Sometimes with less experience.",
        "Sometimes with a similar background.",
        "And you wonder: \"Why not me?\"",
      ],
      conclusion: "It's not a question of competence. It's a question of positioning.",
    },
    form: {
      title: "Join Xperience Pro",
      subtitle: "Fill out the form and we'll contact you via WhatsApp",
      fields: {
        fullName: "Full Name",
        phone: "Phone Number",
        lookingFor: "What are you looking for?",
        offer: "Which offer interests you?",
        submit: "Send via WhatsApp",
      },
      lookingForOptions: {
        stagePFE: "Stage PFE",
        premierEmploi: "Premier Emploi",
        progresserCarriere: "Progresser ma carrière",
        reconversion: "Reconversion Professionnelle",
      },
      offerOptions: {
        xperiencePro: "COACHING PREMIUM - 1200 DH",
        xperience: "COACHING BASIC - 800 DH",
      },
    },
  },
  fr: {
    header: {
      logo: "Xperience Pro",
      nav: {
        program: "Programme",
        forWho: "Pour qui ?",
        price: "Prix",
        faq: "FAQ",
      },
    },
    hero: {
      headline: "Ignoré par les recruteurs ?\n Mettez fin aux candidatures sans réponse.",
      subheading: "Vous envoyez des candidatures. Vous faites des efforts. Mais les réponses n'arrivent pas.",
      forWho: "Pour les candidats qui veulent comprendre ce qui les bloque et comment le corriger.",
      ctaPrimary: "Corriger ce qui bloque",
      ctaSecondary: "Voir comment ça marche",
    },
    socialProof: {
      title: "Xperience Pro: Un programme testé et approuvé",
      stats: [
        { number: "+6000", label: "candidats accompagnés" },
        { number: "92%", label: "ont atteint leurs objectifs professionnels" },
        { number: "80%", label: "l'ont fait en moins de 3 mois" },
      ],
    },
    problem: {
      title: "Vous postulez sans réponse. Vous passez parfois des entretiens, sans suite. Vous améliorez votre CV, sans impact réel.",
      subtitle: "Le plus dur n'est pas le refus. C'est de ne pas savoir quoi corriger.",
      emotional: "Vous voyez d'autres avancer. Parfois avec moins d'expérience. Parfois avec un parcours similaire. Et vous vous demandez : \"Pourquoi pas moi ?\"",
      positioning: "Ce n'est pas une question de compétence. C'est une question de positionnement.",
      reasons: [
        {
          number: "01",
          title: "Tu n'utilises pas les bons outils (dont l'IA) pour adapter ton CV aux offres d'emploi",
          description: "CV générique, sans mots-clés, qui n'attire pas l'attention du recruteur.",
        },
        {
          number: "02",
          title: "Tu ne sais pas comment gérer ton entretien comme un pro",
          description: "Tes réponses sont mal structurées, peu convaincantes.",
        },
        {
          number: "03",
          title: "Tu ne te prépares pas à l'avance pour saisir les opportunités",
          description: "Les bonnes opportunités te passent sous le nez et tu te contentes d'un job qui ne t'intéresse pas.",
        },
      ],
    },
    solution: {
      title: "Xperience Pro :\n La solution complète",                  
      subtitle: "Un accompagnement intensif, structuré et guidé pour les candidats qui sont déterminés à:",
      points: [
        "Identifier pourquoi leurs candidatures n'aboutissent pas",
        "Corriger ce qui bloque réellement côté recruteur",
        "Booster leur recherche d’emploi / Stage grâce à l’IA "
      ],
    },
    cvScorer: {
      title: "Essayez Notre Évaluateur de CV Gratuit",
      subtitle: "Obtenez un retour instantané sur votre CV",
      description: "Téléchargez votre CV et obtenez une analyse détaillée avec des scores sur la structure, la qualité du contenu, la pertinence, le professionnalisme et la compatibilité ATS. Recevez des suggestions personnalisées pour améliorer votre CV avant de postuler.",
      features: [
        "Analyse de CV par IA en quelques secondes",
        "Système de notation à 5 dimensions",
        "Suggestions d'amélioration personnalisées",
        "Vérification de compatibilité ATS",
        "Adaptez votre CV aux descriptions de poste",
      ],
      cta: "Évaluer mon CV maintenant",
      ctaSecondary: "En savoir plus",
    },
    trainer: {
      title: "Préparez-vous au marché d'emploi avec notre expert",
      name: "Ali El Harti",
      role: "Formateur Certifié & Responsable Employabilité",
      image: "/ali.jpg", // Trainer image located in /public/ali.jpg
      bio: [
        "Formateur certifié avec plus de 7 ans d'expérience dans l'accompagnement des jeunes vers le marché de l'emploi.",
        "Spécialisé dans les techniques de recherche d'emploi et de stage.",
        "Plus de 6000 personnes ont bénéficié de son accompagnement.",
        "A animé plus de 100 conférences et ateliers au Maroc et à l'international.",
        "Travaille en tant que Responsable Employabilité et collabore avec plusieurs universités reconnues au Maroc, axé sur les relations entreprises et partenariats industriels.",
        "A été invité par les grands médias tels qu'Al Aoula, Le Matin et M24.",
      ],
      stats: [
        { label: "Années d'expérience", value: "7+" },
        { label: "Personnes coachées", value: "6000+" },
        { label: "Conférences et ateliers", value: "100+" },
      ],
      social: {
        instagram: "https://www.instagram.com/alielharti_ma/", // TODO: Update with actual Instagram URL
        linkedin: "https://linkedin.com/in/ali-el-harti", // TODO: Update with actual LinkedIn URL
      },
    },
    transformation: {
      title: "Ce que tu seras capable de faire après Xperience Pro",
      points: [
        "Construire un CV clair et professionnel que les recruteurs ont envie de lire.",
        "Adapter ton CV à chaque offre sans tout recommencer à zéro.",
        "Avoir un profil LinkedIn propre et attractif qui travaille pour toi.",
        "Arriver en entretien préparé(e), avec des réponses claires et des questions intelligentes.",
      ],
    },
    modules: {
      title: "Le contenu du programme Xperience Pro",
      items: [
        {
          title: "Module 1 : CV clair, lisible et compris par les recruteurs",
          description: "Optimiser votre CV pour qu'il soit :\n• Compréhensible rapidement\n• Aligné avec les attentes des recruteurs\nObjectif : Passer le premier tri et éviter l'élimination automatique.",
        },
        {
          title: "Module 2 : Maitrise des techniques d'entretien",
          description: "Comprendre :\n• Ce que le recruteur cherche vraiment à évaluer\n• Comment éviter les réponses floues ou hors sujet\nObjectif : Mieux performer en entretien, sans improviser.",
        },
        {
          title: "Module 3 : Gérer le stress et convaincre à l'entretien",
          description: "Apprendre à :\n• Gérer le stress avant et pendant l'entretien\n• Bien se renseigner sur l'entreprise et se distinguer\nObjectif : Gagner en confiance et en impact face au recruteur.",
        },
        {
          title: "Module 4 : LinkedIn et positionnement professionnel",
          description: "Optimiser votre présence sur LinkedIn pour :\n• Renforcer votre crédibilité face aux recruteurs\n• Se positionner comme un leader d'opinion dans votre domaine.\nObjectif : Améliorer votre visibilité et votre positionnement sur le marché.",
        },
      ],
    },
    platform: {
      title: "Xperience Pro: Une solution unique",
      subtitle: "Comprendre seul ne suffit pas. Appliquer seul est difficile.",
      points: [
        "Des capsules vidéo claires, accessibles à tout moment, pour comprendre les règles réelles du recrutement et ce que les recruteurs attendent vraiment.",
        "Une structure sur 4 semaines avec des lives, des exercices concrets et des mises en pratique guidées boostées par l'IA.",
        "Avec Xperience : vous avez du feedback réel, vous savez précisément quoi corriger, vous avancez avec un cadre clair.",
        "Important: Les vidéos restent accessibles même après la fin du programme.",
      ],
    },
    whoItsFor: {
      title: "Xperience Pro est fait pour toi si…",
      points: [
        "Tu es étudiant(e), salarié(e) ou en recherche d'emploi.",
        "Tu en as marre d'envoyer des candidatures sans réponse.",
        "Tu veux un cadre clair au lieu de vidéos YouTube au hasard.",
      ],
    },
    price: {
      title: "Choisissez votre formule",
      plans: {
        basic: {
          name: "COACHING BASIC",
          originalPrice: "1000 DH",
          currentPrice: "800 DH",
          description: "Une première étape pour tester notre programme",
          features: [
            "Le Coaching Basic donne accès à un seul module du programme, au choix :",
            "CV professionnel",
            "Techniques d'entretien",
            "Personal branding et LinkedIn",
          ],
        },
        premium: {
          name: "COACHING PREMIUM",
          originalPrice: "1800 DH",
          currentPrice: "1200 DH",
          specialOffer: "RECOMMANDÉ",
          description: "Conçu pour corriger l’ensemble des points clés qui influencent la décision du recruteur.(Programme sur 4 semaines)",
          features: [
            "CV",
            "CV clair, lisible et compréhensible rapidement",
            "Capable de passer le premier tri",
            "Entretiens",
            "Réponses structurées et pertinentes",
            "Meilleure compréhension de ce que le recruteur attend vraiment",
            "LinkedIn",
            "Optimisation du profil",
            "Stratégie de création de contenu",
            "Accompagnement & suivi",
            "Feedback personnalisé live et sur WhatsApp",
            "Ressources et exercices d'application",
          ],
        },
      },
    },
    faq: {
      title: "Questions fréquentes",
      items: [
        {
          question: "Comment j'accède au programme après le paiement ?",
          answer: "Une fois le paiement effectué, vous nous envoyez le reçu du virement via WhatsApp. Après le renseignement du formulaire Onboarding, nous vous donnons accès à la plate-forme Xperience avec les capsules vidéo et au groupe WhatsApp de la communauté",
        },
        {
          question: "Est-ce adapté aux débutants ?",
          answer: "Nos clients sont des étudiants, des fraîchement diplômés et des salariés. Xperience est adapté à tout candidat compétent qui souhaite mettre fin aux candidatures sans réponses et booster son parcours professionnel.",
        },
        {
          question: "Combien de temps je garde l'accès ?",
          answer: "Tu as un accès à vie à toutes les capsules enregistrées. Une fois inscrit(e), tu peux revoir les leçons quand tu veux, où tu veux.",
        },
        {
          question: "Je peux y accéder sur mobile ?",
          answer: "Oui ! La plateforme est entièrement responsive et fonctionne parfaitement sur ton téléphone, tablette ou ordinateur.",
        },
      ],
    },
    testimonials: {
      title: "Ce que disent nos bénéficiaires",
      items: [
        {
          name: "Sarah M.",
          role: "Diplômée récente",
          text: "Xperience Pro a complètement transformé ma recherche d'emploi. Je suis passée de zéro réponse à plusieurs entretiens en seulement 2 mois. Les techniques d'adaptation de CV sont révolutionnaires !",
          rating: 5,
          image: "/placeholder-user.jpg", // TODO: Replace with actual testimonial images
        },
        {
          name: "Ahmed K.",
          role: "Reconversion professionnelle",
          text: "J'étais coincé dans un job qui ne me plaisait pas. Ce programme m'a donné la confiance et les outils pour faire une transition de carrière réussie. Le module de préparation aux entretiens est excellent.",
          rating: 5,
          image: "/placeholder-user.jpg", // TODO: Replace with actual testimonial images
        },
        {
          name: "Fatima L.",
          role: "Étudiante",
          text: "En tant qu'étudiante sans expérience, je pensais que trouver un stage serait impossible. Xperience Pro m'a montré comment mettre en valeur mes compétences et j'ai reçu 3 offres de stage !",
          rating: 5,
          image: "/placeholder-user.jpg", // TODO: Replace with actual testimonial images
        },
        {
          name: "Youssef B.",
          role: "Demandeur d'emploi",
          text: "Les conseils d'optimisation LinkedIn à eux seuls valent l'investissement. J'ai commencé à recevoir des messages de recruteurs en quelques semaines. Je recommande vivement !",
          rating: 5,
          image: "/placeholder-user.jpg", // TODO: Replace with actual testimonial images
        },
      ],
    },
    struggle: {
      paragraphs: [
        "Vous postulez sans réponse.",
        "Vous passez parfois des entretiens, sans suite.",
        "Vous améliorez votre CV, sans impact réel.",
        "Le plus dur n'est pas le refus. C'est de ne pas savoir quoi corriger.",
        "",
        "Vous voyez d'autres avancer.",
        "Parfois avec moins d'expérience.",
        "Parfois avec un parcours similaire.",
        "Et vous vous demandez : \"Pourquoi pas moi ?\"",
      ],
      conclusion: "Ce n'est pas une question de compétence. C'est une question de positionnement.",
    },
    form: {
      title: "Rejoindre Xperience Pro",
      subtitle: "Remplissez le formulaire et nous vous contacterons via WhatsApp",
      fields: {
        fullName: "Nom complet",
        phone: "Numéro de téléphone",
        lookingFor: "Que recherchez-vous ?",
        offer: "Quelle offre vous intéresse ?",
        submit: "Envoyer via WhatsApp",
      },
      lookingForOptions: {
        stagePFE: "Stage PFE",
        premierEmploi: "Premier Emploi",
        progresserCarriere: "Progresser ma carrière",
        reconversion: "Reconversion Professionnelle",
      },
      offerOptions: {
        xperiencePro: "COACHING PREMIUM - 1200 DH",
        xperience: "COACHING BASIC - 800 DH",
      },
    },
  },
}

export default function XperienceProLandingPage() {
  const [language, setLanguage] = useState<Language>("fr")
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0)
  const [testimonialsPerView, setTestimonialsPerView] = useState(4)
  const [currentPartnerIndex, setCurrentPartnerIndex] = useState(0)
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    lookingFor: "",
    offer: "",
    couponCode: "",
  })
  const [showExitIntent, setShowExitIntent] = useState(false)
  const [animatedStats, setAnimatedStats] = useState<{ [key: number]: number }>({})
  const [ctaHoverState, setCtaHoverState] = useState<{ [key: string]: boolean }>({})
  const [holdProgress, setHoldProgress] = useState(0)
  const [isHolding, setIsHolding] = useState(false)
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [showMicroReward, setShowMicroReward] = useState(false)
  const [remainingSpots, setRemainingSpots] = useState(12) // Limited spots counter - fetched from backend
  const [showPremiumMessage, setShowPremiumMessage] = useState(false)
  const [couponFeedback, setCouponFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showCouponWaModal, setShowCouponWaModal] = useState(false)
  const [couponWaData, setCouponWaData] = useState({
    fullName: "",
    phone: "",
    lookingFor: "",
    offer: "",
  })
  const formDataRef = useRef(formData)
  const showFormRef = useRef(showForm)
  const premiumCardRef = useRef<HTMLDivElement | null>(null)
  const premiumTimerRef = useRef<NodeJS.Timeout | null>(null)
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({})
  
  // Fetch remaining spots from backend
  useEffect(() => {
    const fetchRemainingSpots = async () => {
      try {
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime()
        const response = await fetch(`/api/landing-page/remaining-spots?t=${timestamp}`, {
          method: "GET",
          cache: "no-store", // Prevent browser caching
          headers: {
            "Cache-Control": "no-cache",
          },
        })
        if (response.ok) {
          const data = await response.json()
          console.log("Fetched remaining spots:", data.remainingSpots)
          setRemainingSpots(data.remainingSpots || 12)
        } else {
          console.error("Failed to fetch remaining spots:", response.status)
        }
      } catch (error) {
        console.error("Error fetching remaining spots:", error)
        // Keep default value of 12
      }
    }
    fetchRemainingSpots()
    
    // Set testimonials per view based on screen size
    const updateTestimonialsPerView = () => {
      if (window.innerWidth < 640) {
        setTestimonialsPerView(1)
      } else if (window.innerWidth < 1280) {
        setTestimonialsPerView(2)
      } else {
        setTestimonialsPerView(4)
      }
    }
    
    updateTestimonialsPerView()
    window.addEventListener('resize', updateTestimonialsPerView)
    
    return () => {
      window.removeEventListener('resize', updateTestimonialsPerView)
    }
  }, [])

  // Track landing page view
  useEffect(() => {
    const trackPageView = async () => {
      try {
        const response = await fetch('/api/landing-page/track-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ Landing page view tracked:', data)
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          console.error('❌ Failed to track page view:', response.status, errorData)
        }
      } catch (error) {
        console.error('❌ Error tracking page view:', error)
        // Silently fail - don't break user experience
      }
    }
    
    trackPageView()
  }, [])

  // Intersection Observer for Premium Card - Show message after 5 seconds
  useEffect(() => {
    if (!premiumCardRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Premium card is visible - start 5 second timer
            if (!premiumTimerRef.current && !showPremiumMessage) {
              premiumTimerRef.current = setTimeout(() => {
                setShowPremiumMessage(true)
              }, 5000) // 5 seconds
            }
          } else {
            // Premium card is not visible - clear timer if it exists
            if (premiumTimerRef.current) {
              clearTimeout(premiumTimerRef.current)
              premiumTimerRef.current = null
            }
          }
        })
      },
      {
        threshold: 0.5, // Card must be at least 50% visible
        rootMargin: '0px',
      }
    )

    observer.observe(premiumCardRef.current)

    return () => {
      observer.disconnect()
      if (premiumTimerRef.current) {
        clearTimeout(premiumTimerRef.current)
        premiumTimerRef.current = null
      }
    }
  }, [showPremiumMessage])
  
  // Testimonial images from clients_reviews folder
  const testimonialImages = [
    "/clients_reviews/screen9.png",
    "/clients_reviews/screen10.png",
    "/clients_reviews/screen11.png",
    "/clients_reviews/screen1.jpg",
    "/clients_reviews/screen2.jpg",
    "/clients_reviews/screen3.jpg",
    "/clients_reviews/screen4.jpg",
    "/clients_reviews/screen5.jpg",
    "/clients_reviews/screen6.jpg",
    "/clients_reviews/screen7.jpg",
    "/clients_reviews/screen8.jpg",
  ]
  
  // WhatsApp number - Clean format: only digits, country code + number (e.g., 212773213060)
  const ADMIN_WHATSAPP_NUMBER = "212773213060"

  const t = content[language]

  // Animate stats when they become visible
  useEffect(() => {
    const animateStat = (index: number, targetValue: number, isPercentage: boolean) => {
      const duration = 2000 // 2 seconds
      const steps = 60
      const increment = targetValue / steps
      let current = 0
      let step = 0

      const timer = setInterval(() => {
        step++
        current = Math.min(current + increment, targetValue)
        
        if (isPercentage) {
          setAnimatedStats((prev) => ({ ...prev, [index]: Math.round(current) }))
        } else {
          setAnimatedStats((prev) => ({ ...prev, [index]: Math.round(current) }))
        }

        if (step >= steps) {
          clearInterval(timer)
          setAnimatedStats((prev) => ({ ...prev, [index]: targetValue }))
        }
      }, duration / steps)
    }

    // Parse and animate stats when they become visible
    t.socialProof.stats.forEach((stat, index) => {
      const statKey = `stat-${index}`
      if (visibleSections.has(statKey) && !animatedStats[index]) {
        const numberStr = stat.number.replace(/[^0-9.]/g, '')
        const numValue = parseFloat(numberStr)
        
        if (stat.number.includes('%')) {
          animateStat(index, numValue, true)
        } else if (stat.number.includes('+')) {
          // For numbers like +5000, animate to 5000
          animateStat(index, numValue, false)
        }
      }
    })
  }, [visibleSections, t.socialProof.stats, animatedStats])

  // Exit intent detection
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse is moving towards top of screen (trying to close tab)
      if (e.clientY <= 0 && !showExitIntent) {
        setShowExitIntent(true)
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [showExitIntent])

  useEffect(() => {
    formDataRef.current = formData
  }, [formData])

  useEffect(() => {
    showFormRef.current = showForm
  }, [showForm])

  const COUPON_WA_POPUP_SESSION_KEY = "xperience_coupon_whatsapp_popup_v1"

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        if (sessionStorage.getItem(COUPON_WA_POPUP_SESSION_KEY)) return
        if (showFormRef.current) return
        sessionStorage.setItem(COUPON_WA_POPUP_SESSION_KEY, "1")
        const fd = formDataRef.current
        setCouponWaData({
          fullName: fd.fullName,
          phone: fd.phone,
          lookingFor: fd.lookingFor,
          offer: fd.offer,
        })
        setShowCouponWaModal(true)
      } catch {
        /* ignore */
      }
    }, 22000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    Object.keys(sectionRefs.current).forEach((key) => {
      const element = sectionRefs.current[key]
      if (element) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setVisibleSections((prev) => new Set(prev).add(key))
              }
            })
          },
          { threshold: 0.1 }
        )
        observer.observe(element)
        observers.push(observer)
      }
    })

    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [])

  // Handle hash navigation on page load
  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = window.location.hash
      if (hash) {
        const sectionId = hash.substring(1) // Remove the #
        const element = document.getElementById(sectionId)
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth", block: "start" })
          }, 100) // Small delay to ensure page is rendered
        }
      }
    }

    // Handle hash on initial load
    handleHashNavigation()

    // Handle hash changes (e.g., when navigating from another page)
    window.addEventListener("hashchange", handleHashNavigation)

    return () => {
      window.removeEventListener("hashchange", handleHashNavigation)
    }
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
      setMobileMenuOpen(false)
    }
  }

  // Clean phone number - remove all non-digit characters
  const cleanPhoneNumber = (phone: string): string => {
    return phone.replace(/\D/g, "")
  }

  // Format WhatsApp number - ensure it's clean and properly formatted
  const formatWhatsAppNumber = (phone: string): string => {
    const cleaned = cleanPhoneNumber(phone)
    // If it starts with +, remove it
    // If it starts with 00, replace with country code
    if (cleaned.startsWith("00212")) {
      return cleaned.replace("00212", "212")
    }
    // If it starts with 0, replace with country code
    if (cleaned.startsWith("0")) {
      return "212" + cleaned.substring(1)
    }
    // If it already has country code, return as is
    if (cleaned.startsWith("212")) {
      return cleaned
    }
    // Otherwise, assume it's a local number and add country code
    return "212" + cleaned
  }

  const getLookingForLabelForCoupon = (value: string, lang: Language) => {
    const tc = content[lang]
    if (value === "stagePFE") return tc.form.lookingForOptions.stagePFE
    if (value === "premierEmploi") return tc.form.lookingForOptions.premierEmploi
    if (value === "progresserCarriere") return tc.form.lookingForOptions.progresserCarriere
    if (value === "reconversion") return tc.form.lookingForOptions.reconversion
    return lang === "en" ? "Not specified" : "Non précisé"
  }

  const openAdminWhatsAppWithText = (message: string) => {
    let cleanedNumber = cleanPhoneNumber(ADMIN_WHATSAPP_NUMBER)
    if (cleanedNumber.startsWith("00212")) cleanedNumber = cleanedNumber.replace("00212", "212")
    if (cleanedNumber.startsWith("+212")) cleanedNumber = cleanedNumber.replace("+212", "212")
    if (cleanedNumber.startsWith("0") && !cleanedNumber.startsWith("212")) {
      cleanedNumber = "212" + cleanedNumber.substring(1)
    }
    if (!cleanedNumber.startsWith("212")) cleanedNumber = "212" + cleanedNumber
    if (cleanedNumber.length < 10 || cleanedNumber.length > 15) {
      alert(
        language === "en"
          ? "Invalid WhatsApp configuration. Please contact support."
          : "Configuration WhatsApp invalide. Veuillez contacter le support."
      )
      return
    }
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl1 = `https://wa.me/${cleanedNumber}?text=${encodedMessage}`
    const whatsappUrl2 = `https://api.whatsapp.com/send?phone=${cleanedNumber}&text=${encodedMessage}`
    try {
      const win = window.open(whatsappUrl1, "_blank", "noopener,noreferrer")
      if (!win || win.closed || typeof win.closed === "undefined") {
        setTimeout(() => window.open(whatsappUrl2, "_blank", "noopener,noreferrer"), 100)
      }
    } catch {
      window.open(whatsappUrl2, "_blank", "noopener,noreferrer")
    }
  }

  const handleCouponWaSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fullName = couponWaData.fullName.trim()
    const phone = couponWaData.phone.trim()
    if (!fullName || !phone) {
      alert(
        language === "en"
          ? "Please enter your name and phone number."
          : "Veuillez renseigner votre nom et votre numéro de téléphone."
      )
      return
    }
    const lookingForText = getLookingForLabelForCoupon(couponWaData.lookingFor, language)
    const offerText =
      couponWaData.offer.trim() ||
      (language === "en" ? "Not selected yet" : "Pas encore choisie")
    const message =
      language === "en"
        ? `Hello, I would like to receive a coupon for my registration.\n\nName: ${fullName}\nPhone: ${phone}\nGoal: ${lookingForText}\nOffer I'm interested in: ${offerText}`
        : `Bonjour, je souhaite recevoir un coupon pour mon inscription.\n\nNom : ${fullName}\nTéléphone : ${phone}\nObjectif : ${lookingForText}\nOffre souhaitée : ${offerText}`
    openAdminWhatsAppWithText(message)
    setShowCouponWaModal(false)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const t = content[language]
    const lookingForText = formData.lookingFor === "stagePFE" 
      ? t.form.lookingForOptions.stagePFE
      : formData.lookingFor === "premierEmploi"
      ? t.form.lookingForOptions.premierEmploi
      : formData.lookingFor === "progresserCarriere"
      ? t.form.lookingForOptions.progresserCarriere
      : t.form.lookingForOptions.reconversion

    const extractOfferPrice = (offerText: string): number | null => {
      const match = offerText.match(/(\d+(?:[.,]\d+)?)\s*DH/i)
      if (!match) return null
      const value = Number(match[1].replace(",", "."))
      return Number.isFinite(value) ? value : null
    }

    const extractDiscountPercent = (discountLabel: string): number | null => {
      const match = discountLabel.match(/(\d+(?:[.,]\d+)?)\s*%/)
      if (!match) return null
      const value = Number(match[1].replace(",", "."))
      return Number.isFinite(value) ? value : null
    }

    const formatPrice = (value: number): string => {
      return new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 2 }).format(value)
    }

    let couponLine = ""
    let validatedCouponCode = ""

    if (formData.couponCode.trim()) {
      try {
        const couponRes = await fetch("/api/landing-page/coupons/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: formData.couponCode.trim(),
            offer: formData.offer,
          }),
        })
        const couponData = await couponRes.json()
        if (couponRes.ok && couponData?.valid) {
          validatedCouponCode = couponData.code || formData.couponCode.trim().toUpperCase()
          const discountLabel = String(couponData.discountLabel || "")
          const originalPrice = extractOfferPrice(formData.offer)
          const discountPercent = extractDiscountPercent(discountLabel)

          if (originalPrice != null && discountPercent != null) {
            const reducedPrice = Math.max(0, originalPrice * (1 - discountPercent / 100))
            couponLine = language === "en"
              ? ` Coupon applied: ${validatedCouponCode} (${discountLabel}). Price: ${formatPrice(originalPrice)} DH -> ${formatPrice(reducedPrice)} DH.`
              : ` Coupon applique: ${validatedCouponCode} (${discountLabel}). Prix: ${formatPrice(originalPrice)} DH -> ${formatPrice(reducedPrice)} DH.`
          } else {
            couponLine = language === "en"
              ? ` Coupon applied: ${validatedCouponCode} (${discountLabel}).`
              : ` Coupon applique: ${validatedCouponCode} (${discountLabel}).`
          }
          setCouponFeedback({
            type: "success",
            text: language === "en"
              ? `Coupon valid: ${discountLabel}`
              : `Coupon valide: ${discountLabel}`,
          })
        } else {
          setCouponFeedback({
            type: "error",
            text: couponData?.error || (language === "en" ? "Invalid coupon code." : "Code coupon invalide."),
          })
          return
        }
      } catch (error) {
        console.error("❌ Error validating coupon:", error)
        setCouponFeedback({
          type: "error",
          text: language === "en"
            ? "Could not validate coupon right now."
            : "Impossible de valider le coupon pour le moment.",
        })
        return
      }
    } else {
      setCouponFeedback(null)
    }

    const message = language === "en"
      ? `Hi, my name is ${formData.fullName} and I'm looking for ${lookingForText}. I chose this offer: ${formData.offer}. My phone number is ${formData.phone}.${couponLine}`
      : `Bonjour, je m'appelle ${formData.fullName} et je recherche ${lookingForText}. J'ai choisi cette offre : ${formData.offer}. Mon numero de telephone est ${formData.phone}.${couponLine}`

    // Save to database first
    try {
      console.log("💾 Saving lead to database:", {
        fullName: formData.fullName,
        phone: formData.phone,
        lookingFor: formData.lookingFor,
        offer: formData.offer,
      })
      
      const response = await fetch("/api/landing-page/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          lookingFor: formData.lookingFor,
          offer: formData.offer,
          couponCode: validatedCouponCode || formData.couponCode.trim() || undefined,
        }),
      })

      const responseData = await response.json()
      
      if (!response.ok) {
        console.error("❌ Failed to save lead to database:", response.status, responseData)
        // Continue anyway - still send WhatsApp message
      } else {
        console.log("✅ Lead saved successfully:", responseData)
      }
    } catch (error) {
      console.error("❌ Error saving lead to database:", error)
      // Continue anyway - still send WhatsApp message
    }

    // Clean and format the WhatsApp number - ensure only digits
    let cleanedNumber = cleanPhoneNumber(ADMIN_WHATSAPP_NUMBER)
    
    // For WhatsApp Business, ensure proper format
    // Remove leading + or 00 if present
    if (cleanedNumber.startsWith("00212")) {
      cleanedNumber = cleanedNumber.replace("00212", "212")
    }
    if (cleanedNumber.startsWith("+212")) {
      cleanedNumber = cleanedNumber.replace("+212", "212")
    }
    // Remove leading 0 if country code is missing
    if (cleanedNumber.startsWith("0") && !cleanedNumber.startsWith("212")) {
      cleanedNumber = "212" + cleanedNumber.substring(1)
    }
    // Ensure it starts with country code
    if (!cleanedNumber.startsWith("212")) {
      cleanedNumber = "212" + cleanedNumber
    }
    
    // Validate number format
    if (cleanedNumber.length < 10 || cleanedNumber.length > 15) {
      alert(language === "en" 
        ? "Invalid phone number format. Please check the WhatsApp number configuration."
        : "Format de numéro invalide. Veuillez vérifier la configuration du numéro WhatsApp.")
      return
    }
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message)
    
    // Try multiple WhatsApp URL formats for business numbers
    // Primary: wa.me (works for both personal and business)
    const whatsappUrl1 = `https://wa.me/${cleanedNumber}?text=${encodedMessage}`
    
    // Alternative: api.whatsapp.com (sometimes works better for business)
    const whatsappUrl2 = `https://api.whatsapp.com/send?phone=${cleanedNumber}&text=${encodedMessage}`
    
    // Try primary format first, with fallback
    try {
      const win = window.open(whatsappUrl1, "_blank", "noopener,noreferrer")
      // If window didn't open (blocked), try alternative
      if (!win || win.closed || typeof win.closed === "undefined") {
        setTimeout(() => {
          window.open(whatsappUrl2, "_blank", "noopener,noreferrer")
        }, 100)
      }
    } catch (error) {
      // Fallback to alternative format
      window.open(whatsappUrl2, "_blank", "noopener,noreferrer")
    }
    
    // Show micro-reward
    setShowMicroReward(true)
    setTimeout(() => {
      setShowMicroReward(false)
    }, 3000)

    // Reset form
    setFormData({
      fullName: "",
      phone: "",
      lookingFor: "",
      offer: "",
      couponCode: "",
    })
    setCouponFeedback(null)
    setShowForm(false)
  }

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @keyframes pulseModerate {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="flex items-center gap-2 sm:gap-3 group hover:opacity-80 transition-opacity duration-200">
                <img 
                  src="/logos/dark blue secondary logo.svg" 
                  alt="XPERIENCE Logo" 
                  className="h-8 sm:h-10 w-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </a>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("program")}
                className="text-gray-700 hover:text-[#005eb8] transition-colors font-medium"
              >
                {t.header.nav.program}
              </button>
              <button
                onClick={() => scrollToSection("for-who")}
                className="text-gray-700 hover:text-[#005eb8] transition-colors font-medium"
              >
                {t.header.nav.forWho}
              </button>
              <button
                onClick={() => scrollToSection("price")}
                className="text-gray-700 hover:text-[#005eb8] transition-colors font-medium"
              >
                {t.header.nav.price}
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className="text-gray-700 hover:text-[#005eb8] transition-colors font-medium"
              >
                {language === "en" ? "Testimonials" : "Témoignages"}
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="text-gray-700 hover:text-[#005eb8] transition-colors font-medium"
              >
                {t.header.nav.faq}
              </button>
            </nav>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  language === "en"
                    ? "bg-[#005eb8] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("fr")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  language === "fr"
                    ? "bg-[#005eb8] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                FR
              </button>
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden ml-2 p-2 text-gray-700 hover:text-[#005eb8] transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <nav className="flex flex-col space-y-3">
                <button
                  onClick={() => scrollToSection("program")}
                  className="text-left px-4 py-2 text-gray-700 hover:text-[#005eb8] hover:bg-gray-50 rounded-md transition-colors font-medium"
                >
                  {t.header.nav.program}
                </button>
                <button
                  onClick={() => scrollToSection("for-who")}
                  className="text-left px-4 py-2 text-gray-700 hover:text-[#005eb8] hover:bg-gray-50 rounded-md transition-colors font-medium"
                >
                  {t.header.nav.forWho}
                </button>
                <button
                  onClick={() => scrollToSection("price")}
                  className="text-left px-4 py-2 text-gray-700 hover:text-[#005eb8] hover:bg-gray-50 rounded-md transition-colors font-medium"
                >
                  {t.header.nav.price}
                </button>
                <button
                  onClick={() => scrollToSection("testimonials")}
                  className="text-left px-4 py-2 text-gray-700 hover:text-[#005eb8] hover:bg-gray-50 rounded-md transition-colors font-medium"
                >
                  {language === "en" ? "Testimonials" : "Témoignages"}
                </button>
                <button
                  onClick={() => scrollToSection("faq")}
                  className="text-left px-4 py-2 text-gray-700 hover:text-[#005eb8] hover:bg-gray-50 rounded-md transition-colors font-medium"
                >
                  {t.header.nav.faq}
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#005eb8] via-[#0476D7] to-[#0068A7] text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)'
          }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {language === "fr" 
                ? (
                  <>
                    Ignoré par les recruteurs ?<br className="md:hidden" /> Mettez fin aux candidatures sans réponse.
                  </>
                )
                : t.hero.headline
              }
            </h1>
            
            <p className="text-lg mb-6 text-blue-200">
              {t.hero.forWho}
            </p>
            
            {/* YouTube Video Embed - Minimal branding */}
            <div className="mb-8 max-w-4xl mx-auto">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg shadow-2xl"
                  src="https://www.youtube-nocookie.com/embed/5Jf283OoTM4?modestbranding=1&rel=0&controls=1&iv_load_policy=3&fs=1&playsinline=1"
                  title="Xperience Pro Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
            
            {/* Limited Spots Badge */}
            <div className="mb-8 flex justify-center">
              <div className="bg-[#FFBC00] text-gray-900 px-6 py-2 rounded-full text-sm md:text-base font-bold shadow-lg animate-pulse">
                ⚡ {language === "en" 
                  ? `Only ${remainingSpots} spots left this month!` 
                  : `Il ne reste que ${remainingSpots} places ce mois-ci !`
                }
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => scrollToSection("price")}
                onMouseEnter={() => setCtaHoverState({ ...ctaHoverState, heroPrimary: true })}
                onMouseLeave={() => setCtaHoverState({ ...ctaHoverState, heroPrimary: false })}
                className="bg-[#FFBC00] hover:bg-[#e6a800] text-gray-900 font-bold px-8 py-4 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-all duration-200 flex items-end gap-2 group animate-button-bounce"
              >
                <span className="transition-all duration-200">
                  {ctaHoverState.heroPrimary 
                    ? (language === "en" ? "Fix My Job Search Now" : "Corriger ce qui bloque")
                    : t.hero.ctaPrimary
                  }
                </span>
                <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-200 flex-shrink-0" />
              </button>
             
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-12 md:py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xl md:text-2xl mb-6 font-bold text-black-900 leading-relaxed text-center">
              {t.hero.subheading}
              {language === "fr" && (
                <>
                  <br />
                  <span className="block mt-2">Et vous ne savez pas pourquoi.</span>
                </>
              )}
            </p>
          <h2 className="text-2xl md:text-3xl text-center mb-8 text-gray-900">
            {t.socialProof.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {t.socialProof.stats.map((stat, index) => {
              const isVisible = visibleSections.has(`stat-${index}`)
              const animatedValue = animatedStats[index] ?? 0
              const isPercentage = stat.number.includes('%')
              const hasPlus = stat.number.includes('+')
              
              // Format the displayed number
              let displayNumber = stat.number
              if (isVisible && animatedValue > 0) {
                if (isPercentage) {
                  displayNumber = `${animatedValue}%`
                } else if (hasPlus) {
                  displayNumber = `+${animatedValue.toLocaleString()}`
                } else {
                  displayNumber = animatedValue.toString()
                }
              }

              // Calculate progress bar percentage
              const numberStr = stat.number.replace(/[^0-9.]/g, '')
              const maxValue = parseFloat(numberStr)
              const progressPercentage = isVisible && maxValue > 0 ? (animatedValue / maxValue) * 100 : 0

              return (
                <div
                  key={index}
                  ref={(el) => {
                    sectionRefs.current[`stat-${index}`] = el
                  }}
                  className={`bg-gradient-to-br from-[#005eb8] to-[#0476D7] p-8 rounded-2xl shadow-xl text-white text-center transform transition-all duration-700 ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="text-5xl md:text-6xl font-bold mb-2 text-[#FFBC00]">
                    {displayNumber}
                  </div>
                  <div className="text-lg md:text-xl font-medium mb-4">{stat.label}</div>
                  {/* Animated Progress Bar */}
                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#FFBC00] h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
 {/* Testimonials Section - Carousel */}
 <section id="testimonials" className="py-12 sm:py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 text-gray-900">
            {t.testimonials.title}
          </h2>
          <div className="relative">
            {/* Carousel Container */}
            <div className="overflow-hidden rounded-2xl">
              <div className="relative w-full">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ 
                    transform: `translateX(-${currentTestimonialIndex * 100}%)` 
                  }}
                >
                  {Array.from({ length: Math.ceil(testimonialImages.length / testimonialsPerView) }).map((_, groupIndex) => (
                    <div
                      key={groupIndex}
                      className="flex-shrink-0 w-full flex"
                    >
                      {testimonialImages
                        .slice(groupIndex * testimonialsPerView, (groupIndex + 1) * testimonialsPerView)
                        .map((image, imageIndex) => {
                          const actualIndex = groupIndex * testimonialsPerView + imageIndex
                          return (
                            <div
                              key={actualIndex}
                              className="flex-shrink-0 flex items-center justify-center"
                              style={{ width: `${100 / testimonialsPerView}%` }}
                            >
                              <div className="w-full px-2">
                                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                  <Image
                                    src={image}
                                    alt={`Testimonial ${actualIndex + 1}`}
                                    width={400}
                                    height={300}
                                    className="w-full h-auto object-contain max-h-[250px] sm:max-h-[300px] md:max-h-[350px]"
                                    priority={actualIndex < 3}
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <button
              onClick={() => {
                const maxIndex = Math.ceil(testimonialImages.length / testimonialsPerView) - 1
                setCurrentTestimonialIndex((prev) => prev === 0 ? maxIndex : prev - 1)
              }}
              className="absolute left-1 sm:left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#005eb8] p-1.5 sm:p-2 md:p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </button>
            <button
              onClick={() => {
                const maxIndex = Math.ceil(testimonialImages.length / testimonialsPerView) - 1
                setCurrentTestimonialIndex((prev) => prev >= maxIndex ? 0 : prev + 1)
              }}
              className="absolute right-1 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#005eb8] p-1.5 sm:p-2 md:p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </button>
            
            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: Math.max(1, Math.ceil(testimonialImages.length / testimonialsPerView)) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonialIndex(index)}
                  className={`h-2 rounded-full transition-all duration-200 ${
                    index === currentTestimonialIndex
                      ? "bg-[#005eb8] w-8"
                      : "bg-gray-300 hover:bg-gray-400 w-2"
                  }`}
                  aria-label={`Go to testimonial group ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Struggle/Positioning Section */}
      <section className="py-10 md:py-14 bg-gradient-to-b from-white to-gray-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title */}
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">
              {language === "en" ? "Does This Sound Familiar?" : "Ça vous parle ?"}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#005eb8] to-[#0476D7] mx-auto rounded-full"></div>
          </div>

          {/* Bullet Points 1-3 */}
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-3 mb-6">
            {/* 1. Vous postulez sans réponse. */}
            <div className="flex items-start gap-3 group hover:translate-x-1 transition-all duration-200">
              <div className="flex-shrink-0 mt-1.5 relative">
                <div className="w-2 h-2 rounded-full bg-[#005eb8] group-hover:bg-[#0476D7] transition-all duration-200 shadow-sm group-hover:shadow-md"></div>
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#005eb8] opacity-0 group-hover:opacity-30 group-hover:scale-150 transition-all duration-300"></div>
              </div>
              <p className="text-base md:text-lg text-gray-800 leading-snug flex-1 group-hover:text-gray-900 transition-colors duration-200">
                {t.struggle.paragraphs[0]}
              </p>
            </div>
            
            {/* 2. Vous passez parfois des entretiens, sans suite. */}
            <div className="flex items-start gap-3 group hover:translate-x-1 transition-all duration-200">
              <div className="flex-shrink-0 mt-1.5 relative">
                <div className="w-2 h-2 rounded-full bg-[#005eb8] group-hover:bg-[#0476D7] transition-all duration-200 shadow-sm group-hover:shadow-md"></div>
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#005eb8] opacity-0 group-hover:opacity-30 group-hover:scale-150 transition-all duration-300"></div>
              </div>
              <p className="text-base md:text-lg text-gray-800 leading-snug flex-1 group-hover:text-gray-900 transition-colors duration-200">
                {t.struggle.paragraphs[1]}
              </p>
            </div>
            
            {/* 3. Vous améliorez votre CV, sans impact réel. */}
            <div className="flex items-start gap-3 group hover:translate-x-1 transition-all duration-200 md:col-span-2">
              <div className="flex-shrink-0 mt-1.5 relative">
                <div className="w-2 h-2 rounded-full bg-[#005eb8] group-hover:bg-[#0476D7] transition-all duration-200 shadow-sm group-hover:shadow-md"></div>
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#005eb8] opacity-0 group-hover:opacity-30 group-hover:scale-150 transition-all duration-300"></div>
              </div>
              <p className="text-base md:text-lg text-gray-800 leading-snug flex-1 group-hover:text-gray-900 transition-colors duration-200">
                {t.struggle.paragraphs[2]}
              </p>
            </div>
          </div>

          {/* Key Insight - Highlighted Card (4) */}
          <div className="bg-gradient-to-r from-[#005eb8] via-[#0476D7] to-[#005eb8] p-6 md:p-7 rounded-2xl shadow-2xl text-white mb-6 transform hover:scale-[1.02] hover:shadow-3xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)'
              }}></div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="relative z-10 text-center">
              <p className="text-base md:text-lg leading-relaxed font-semibold">
                {t.struggle.paragraphs[3].replace('👉 ', '')}
              </p>
            </div>
          </div>

          {/* Bullet Points 5-8 */}
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-3 mb-6">
            {/* 5. Vous voyez d'autres avancer. */}
            <div className="flex items-start gap-3 group hover:translate-x-1 transition-all duration-200">
              <div className="flex-shrink-0 mt-1.5 relative">
                <div className="w-2 h-2 rounded-full bg-[#005eb8] group-hover:bg-[#0476D7] transition-all duration-200 shadow-sm group-hover:shadow-md"></div>
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#005eb8] opacity-0 group-hover:opacity-30 group-hover:scale-150 transition-all duration-300"></div>
              </div>
              <p className="text-base md:text-lg text-gray-800 leading-snug flex-1 group-hover:text-gray-900 transition-colors duration-200">
                {t.struggle.paragraphs[5]}
              </p>
            </div>
            
            {/* 6. Parfois avec moins d'expérience. */}
            <div className="flex items-start gap-3 group hover:translate-x-1 transition-all duration-200">
              <div className="flex-shrink-0 mt-1.5 relative">
                <div className="w-2 h-2 rounded-full bg-[#005eb8] group-hover:bg-[#0476D7] transition-all duration-200 shadow-sm group-hover:shadow-md"></div>
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#005eb8] opacity-0 group-hover:opacity-30 group-hover:scale-150 transition-all duration-300"></div>
              </div>
              <p className="text-base md:text-lg text-gray-800 leading-snug flex-1 group-hover:text-gray-900 transition-colors duration-200">
                {t.struggle.paragraphs[6]}
              </p>
            </div>
            
            {/* 7. Parfois avec un parcours similaire. */}
            <div className="flex items-start gap-3 group hover:translate-x-1 transition-all duration-200">
              <div className="flex-shrink-0 mt-1.5 relative">
                <div className="w-2 h-2 rounded-full bg-[#005eb8] group-hover:bg-[#0476D7] transition-all duration-200 shadow-sm group-hover:shadow-md"></div>
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#005eb8] opacity-0 group-hover:opacity-30 group-hover:scale-150 transition-all duration-300"></div>
              </div>
              <p className="text-base md:text-lg text-gray-800 leading-snug flex-1 group-hover:text-gray-900 transition-colors duration-200">
                {t.struggle.paragraphs[7]}
              </p>
            </div>
            
            {/* 8. Et vous vous demandez : "Pourquoi pas moi ?" */}
            <div className="flex items-start gap-3 group hover:translate-x-1 transition-all duration-200">
              <div className="flex-shrink-0 mt-1.5 relative">
                <div className="w-2 h-2 rounded-full bg-[#005eb8] group-hover:bg-[#0476D7] transition-all duration-200 shadow-sm group-hover:shadow-md"></div>
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#005eb8] opacity-0 group-hover:opacity-30 group-hover:scale-150 transition-all duration-300"></div>
              </div>
              <p className="text-base md:text-lg text-gray-800 leading-snug flex-1 group-hover:text-gray-900 transition-colors duration-200">
                {t.struggle.paragraphs[8]}
              </p>
            </div>
          </div>

          {/* Conclusion - Call to Action Card (9-10) */}
          <div className="bg-gradient-to-br from-[#FFBC00] via-[#FFD700] to-[#FFBC00] p-6 md:p-7 rounded-2xl shadow-2xl transform hover:scale-[1.02] hover:shadow-3xl transition-all duration-300 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="relative z-10 space-y-2">
              <p className="text-lg md:text-xl text-gray-900 font-bold leading-relaxed">
                {t.struggle.conclusion.split('.')[0]}.
              </p>
              <p className="text-lg md:text-xl text-gray-900 font-bold leading-relaxed">
                {t.struggle.conclusion.split('.').length > 1 ? t.struggle.conclusion.split('.')[1].trim() + '.' : ''}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      {t.solution && (
        <section className="py-16 md:py-24 bg-gradient-to-br from-[#005eb8] via-[#0476D7] to-[#0068A7] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                {(() => {
                  const parts = t.solution.title.split(/:\s*\n?\s*/);
                  if (parts.length > 1) {
                    return (
                      <>
                        {parts[0]}:<br className="md:hidden" />
                        <span className="text-[#FFBC00] block md:inline md:ml-2">{parts[1]}</span>
                      </>
                    );
                  }
                  return t.solution.title;
                })()}
              </h2>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                {t.solution.subtitle}
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                {t.solution.points.map((point, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="text-4xl font-bold text-[#FFBC00] mb-3">{index + 1}</div>
                    <p className="text-lg leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => scrollToSection("price")}
                className="mt-12 bg-[#FFBC00] hover:bg-[#e6a800] text-gray-900 font-bold px-8 py-4 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-all duration-200 flex items-end gap-2 mx-auto animate-button-bounce"
              >
                {language === "en" ? "Fix What's Blocking My Applications" : "Corriger ce qui bloque mes candidatures"}
                <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-200" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Trainer Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              {t.trainer.title}
            </h2>
            <div
              ref={(el) => {
                sectionRefs.current["trainer"] = el
              }}
              className={`bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-700 ${
                visibleSections.has("trainer") ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <div className="md:flex">
                <div className="md:w-1/3 bg-gradient-to-br from-[#005eb8] to-[#0476D7] p-8 md:p-12 text-white flex flex-col items-center justify-center">
                  <div className="w-32 h-32 rounded-full mb-6 border-4 border-white/30 overflow-hidden bg-white/20 flex items-center justify-center relative">
                    {t.trainer.image ? (
                      <Image
                        src={t.trainer.image}
                        alt={t.trainer.name}
                        width={128}
                        height={128}
                        className="object-cover rounded-full"
                        priority
                      />
                    ) : (
                      <Users className="w-16 h-16 text-white" />
                    )}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">{t.trainer.name}</h3>
                  <p className="text-blue-200 text-center mb-6">{t.trainer.role}</p>
                  <div className="flex gap-4">
                    <a
                      href={t.trainer.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all duration-200 transform hover:scale-110"
                    >
                      <Instagram className="w-6 h-6" />
                    </a>
                    <a
                      href={t.trainer.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all duration-200 transform hover:scale-110"
                    >
                      <Linkedin className="w-6 h-6" />
                    </a>
                  </div>
                </div>
                <div className="md:w-2/3 p-8 md:p-12">
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {t.trainer.stats.map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className="text-3xl font-bold text-[#005eb8] mb-1">{stat.value}</div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    {t.trainer.bio.map((paragraph, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#005eb8] mt-1 flex-shrink-0" />
                        <p className="text-gray-700 leading-relaxed">{paragraph}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Modules Section */}
      <section id="program" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t.modules.title}
            </h2>
            <div className="flex justify-center">
              <div 
                className="bg-red-500 text-white px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2"
                style={{
                  animation: 'pulseModerate 2s ease-in-out infinite'
                }}
              >
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{language === "en" ? "Recorded capsules + live + follow-up" : "Capsules enregistrées + live + suivi"}</span>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {t.modules.items.map((module, index) => (
              <div
                key={index}
                ref={(el) => {
                  sectionRefs.current[`module-${index}`] = el
                }}
                className={`bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 ${
                  visibleSections.has(`module-${index}`)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#005eb8] text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{module.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {module.description.split('\n').map((line, lineIndex, lines) => {
                    if (line.startsWith('Objectif :')) {
                      return (
                        <span key={lineIndex} className="font-semibold">
                          {line}
                          {lineIndex < lines.length - 1 && '\n'}
                        </span>
                      )
                    }
                    return (
                      <span key={lineIndex}>
                        {line}
                        {lineIndex < lines.length - 1 && '\n'}
                      </span>
                    )
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Section - Enhanced */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
            {t.platform.subtitle && (
                <p className="text-xl md:text-2xl font-bold text-gray-700 mb-8 italic">
                  {t.platform.subtitle}
                </p>
              )}
              <h2 className="text-3xl md:text-4xl font-semibold mb-6 text-gray-900">
                {t.platform.title}
              </h2>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 md:p-12 rounded-2xl shadow-lg">
              <div className="space-y-6">
                {t.platform.points.map((point, index) => (
                  <div key={index} className="flex items-start gap-4 text-left">
                    <CheckCircle2 className="w-6 h-6 text-[#005eb8] flex-shrink-0 mt-1" />
                    <p className="text-lg text-gray-700 leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section id="for-who" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              {t.whoItsFor.title}
            </h2>
            <div className="space-y-4">
              {t.whoItsFor.points.map((point, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-md border-l-4 border-[#FFBC00] flex items-start gap-4"
                >
                  <Users className="w-6 h-6 text-[#005eb8] mt-1 flex-shrink-0" />
                  <p className="text-lg text-gray-700 flex-1">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Price Section */}
      <section
        id="price"
        ref={(el) => {
          sectionRefs.current["price"] = el
        }}
        className="py-16 md:py-24 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            {t.price.title}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {/* Basic Plan Card */}
            <div
              className={`bg-white rounded-2xl shadow-xl border border-gray-200 p-8 transform transition-all duration-700 ${
                visibleSections.has("price") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-lg text-gray-500 line-through">{t.price.plans.basic.originalPrice}</span>
                </div>
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-2">
                  {t.price.plans.basic.currentPrice}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-4">{t.price.plans.basic.name}</h3>
                {t.price.plans.basic.description && (
                  <p className="text-gray-600 text-sm mt-2 italic">{t.price.plans.basic.description}</p>
                )}
              </div>
              <ul className="space-y-3 mb-8">
                {t.price.plans.basic.features.map((feature, index) => {
                  const isFirstLine = index === 0
                  return (
                    <li key={index} className="flex items-start gap-2">
                      {isFirstLine ? (
                        <span className="text-gray-600 text-sm leading-relaxed font-semibold">{feature}</span>
                      ) : (
                        <span className="text-gray-600 text-sm leading-relaxed">o {feature}</span>
                      )}
                    </li>
                  )
                })}
              </ul>
              <button
                onClick={() => {
                  setFormData({ ...formData, offer: t.form.offerOptions.xperience })
                  setShowForm(true)
                }}
                onMouseEnter={() => setCtaHoverState({ ...ctaHoverState, basicPlan: true })}
                onMouseLeave={() => setCtaHoverState({ ...ctaHoverState, basicPlan: false })}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-all duration-200 group animate-button-bounce"
              >
                <span className="transition-all duration-200">
                  {ctaHoverState.basicPlan
                    ? (language === "en" ? "Click to choose Basic offer" : "Cliquer pour choisir l'offre Basic")
                    : (language === "en" ? "Click to choose Basic offer" : "Cliquer pour choisir l'offre Basic")
                  }
                </span>
              </button>
            </div>

            {/* Premium Plan Card */}
            <div
              ref={(el) => {
                premiumCardRef.current = el
              }}
              className={`bg-gradient-to-br from-[#005eb8] via-[#0476D7] to-[#0068A7] rounded-2xl shadow-xl border-2 border-[#FFBC00] p-8 transform transition-all duration-700 relative ${
                visibleSections.has("price") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "100ms" }}
            >
              {/* Special Offer Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <span className="bg-[#FFBC00] text-gray-900 font-bold px-4 py-1 rounded-full text-sm shadow-lg">
                  {t.price.plans.premium.specialOffer}
                </span>
              </div>
              {/* Limited Spots Badge */}
              <div className="absolute -top-3 sm:-top-4 right-2 sm:right-4 z-10">
                <div className="bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span className="hidden sm:inline">{remainingSpots} {language === "en" ? "left" : "restantes"}</span>
                  <span className="sm:hidden">{remainingSpots}</span>
                </div>
              </div>
              
              <div className="text-center mb-6 text-white">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-lg text-blue-200 line-through">{t.price.plans.premium.originalPrice}</span>
                </div>
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#FFBC00] mb-2">
                  {t.price.plans.premium.currentPrice}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-4">{t.price.plans.premium.name}</h3>
                {t.price.plans.premium.description && (
                  <p className="text-blue-100 text-sm mt-2 italic">{t.price.plans.premium.description}</p>
                )}
              </div>
              <ul className="space-y-3 mb-8 text-white">
                {t.price.plans.premium.features.map((feature, index) => {
                  // Check if this is a section title (CV, LinkedIn, Entretiens, Accompagnement & suivi)
                  const isSectionTitle = feature === "CV" || 
                                         feature === "LinkedIn" || 
                                         feature === "Entretiens" || 
                                         feature === "Accompagnement & suivi" ||
                                         feature === "Interviews" ||
                                         feature === "Support & follow-up"
                  
                  if (isSectionTitle) {
                    return (
                      <li key={index} className="mt-4 first:mt-0">
                        <h4 className="text-white font-bold text-base mb-2">{feature}</h4>
                      </li>
                    )
                  }
                  
                  // Regular feature item
                  return (
                    <li key={index} className="flex items-start gap-2 ml-4">
                      <span className="text-white/90 text-sm leading-relaxed">o {feature}</span>
                    </li>
                  )
                })}
              </ul>
              <button
                onClick={() => {
                  setFormData({ ...formData, offer: t.form.offerOptions.xperiencePro })
                  setShowForm(true)
                }}
                className="w-full bg-[#FFBC00] hover:bg-[#e6a800] text-gray-900 font-bold py-4 px-6 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-all duration-200 group animate-button-bounce"
              >
                <span className="transition-all duration-200">
                  {language === "en" ? "Click to choose premium offer" : "Cliquer pour choisir l'offre premium"}
                </span>
              </button>
              
              {/* Delayed Message - Shows after 5 seconds of viewing */}
              <div
                className={`mt-4 transition-all duration-500 ${
                  showPremiumMessage
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2 pointer-events-none"
                }`}
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <p className="text-center text-white text-sm md:text-base italic font-medium flex items-center justify-center gap-2">
                    <span className="text-lg">💡</span>
                    <span>
                      {language === "en" 
                        ? "One salary received can largely exceed the price of the program."
                        : "Un seul salaire encaissé peut largement dépasser le prix du programme."
                      }
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section - Slideshow */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            {language === "en" ? "They trusted us" : "Ils nous ont fait confiance"}
          </h2>
          <div className="relative">
            {/* Carousel Container */}
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentPartnerIndex * (100 / 6)}%)` }}
              >
                {[
                  "/partenaires/AIESEC.png",
                  "/partenaires/Al_Aoula_Tv_Logo.png",
                  "/partenaires/EMSI.png",
                  "/partenaires/ENCG Casa.png",
                  "/partenaires/ENCG Kenitra.png",
                  "/partenaires/ENCG Oujda.png",
                  "/partenaires/ENCG Tanger.png",
                  "/partenaires/ENCG-S.png",
                  "/partenaires/ENSA Kenitra.png",
                  "/partenaires/ENSA Tetouan.png",
                  "/partenaires/Le-Matinma.png",
                  "/partenaires/logo_alowla.png",
                  "/partenaires/logo_alowla1.png",
                  "/partenaires/Logo_groupe_ISCAE.jpg",
                  "/partenaires/Logo_iav.png",
                  "/partenaires/Logo_inpt.PNG",
                  "/partenaires/Logo_Université_Euromed_de_Fès.png",
                  "/partenaires/M24_tv_logo.jpg",
                  "/partenaires/Universite_Cadi_Ayyad.png",
                ].map((logo, index) => (
                  <div
                    key={index}
                    className="min-w-[16.666%] md:min-w-[16.666%] flex-shrink-0 px-2"
                  >
                    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center h-24 md:h-32 group hover:scale-105">
                      <Image
                        src={logo}
                        alt={`Partner ${index + 1}`}
                        width={120}
                        height={80}
                        className="max-w-full max-h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <button
              onClick={() => setCurrentPartnerIndex((prev) => 
                prev === 0 ? Math.max(0, 19 - 6) : Math.max(0, prev - 1)
              )}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#005eb8] p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
              aria-label="Previous partners"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentPartnerIndex((prev) => 
                prev >= 19 - 6 ? 0 : prev + 1
              )}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#005eb8] p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
              aria-label="Next partners"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            {t.faq.title}
          </h2>
          <div className="space-y-4">
            {t.faq.items.map((item, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#005eb8] flex-shrink-0 transition-transform ${
                      openFaqIndex === index ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roulette Section - Xperience theme */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-[#005eb8] via-[#0476D7] to-[#0068A7] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#FFBC00]/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl text-white mb-3 drop-shadow-lg font-normal">
              {language === "en"
                ? "Spin the wheel and win 20% OFF Xperience Pro!"
                : "Tournez la roue et gagnez 20% de réduction sur Xperience Pro !"}
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm md:text-base mb-6">
              <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-5 py-3 rounded-full shadow-xl border-2 border-[#005eb8]">
                <span className="w-5 h-5 rounded-full bg-[#005eb8] shadow-lg"></span>
                <span className="text-gray-900">20% OFF Xperience Pro</span>
              </div>
              <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-5 py-3 rounded-full shadow-xl border-2 border-slate-200">
                <span className="w-5 h-5 rounded-full bg-white border border-slate-200 shadow-inner"></span>
                <span className="text-gray-900">{language === "en" ? "Try Again" : "Réessayer"}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <RouletteWheel language={language} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-3">
            <Image
              src="/logo_white.png"
              alt="XPERIENCE Logo"
              width={200}
              height={60}
              className="h-10 md:h-12 w-auto"
            />
          </div>
          <p className="text-gray-400 mb-3 text-sm">
            {language === "en"
              ? "Transform your job search. Get real results."
              : "Transforme ta recherche d'emploi. Obtiens de vrais résultats."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <div className="flex justify-center gap-4">
              <a
                href={t.trainer.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={t.trainer.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} XPERIENCE. {language === "en" ? "Developed by" : "Développé par"}{" "}
              <a
                href="https://www.linkedin.com/in/amr-el-harti/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Amr El Harti
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Micro-Reward Modal - Phase 3 */}
      {showMicroReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-full p-8 shadow-2xl transform animate-scale-in">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <div className="text-2xl font-bold text-[#005eb8] mb-2">
                {language === "en" ? "Great Decision!" : "Bonne décision !"}
              </div>
              <CheckCircle2 className="w-16 h-16 text-[#FFBC00] mx-auto" />
            </div>
          </div>
        </div>
      )}

      {/* Exit Intent Modal */}
      {showExitIntent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setShowExitIntent(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowExitIntent(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="text-center">
              <div className="mb-4">
                <MessageSquare className="w-16 h-16 text-[#005eb8] mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {language === "en" 
                  ? "You're one click away from fixing what's blocking you"
                  : "Vous êtes à un clic de corriger ce qui me bloque"
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {language === "en"
                  ? "Don't let another opportunity pass by. See how we help candidates get real results."
                  : "Ne laissez pas passer une autre opportunité. Découvrez comment nous aidons les candidats à obtenir de vrais résultats."
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowExitIntent(false)
                    scrollToSection("price")
                  }}
                  className="flex-1 bg-[#005eb8] hover:bg-[#0476D7] text-white font-bold px-6 py-3 rounded-lg transition-all duration-200"
                >
                  {language === "en" ? "See Offers" : "Voir les offres"}
                </button>
                <button
                  onClick={() => setShowExitIntent(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-3 rounded-lg transition-all duration-200"
                >
                  {language === "en" ? "Maybe Later" : "Peut-être plus tard"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coupon request via WhatsApp (timed, once per session) */}
      {showCouponWaModal && (
        <div
          className="fixed inset-0 z-[55] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setShowCouponWaModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowCouponWaModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="p-6 pt-10 space-y-4">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-[#25D366] mx-auto mb-3" />
                <h3 className="text-xl font-bold text-gray-900">
                  {language === "en" ? "Get your coupon on WhatsApp" : "Obtenir un coupon via WhatsApp"}
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  {language === "en"
                    ? "Send us a short message — we will reply with your personalized coupon."
                    : "Envoyez-nous un court message — nous vous répondrons avec votre coupon personnalisé."}
                </p>
              </div>
              <form onSubmit={handleCouponWaSubmit} className="space-y-4">
                <div>
                  <label htmlFor="couponWaFullName" className="block text-sm font-medium text-gray-700 mb-1">
                    {t.form.fields.fullName} *
                  </label>
                  <input
                    id="couponWaFullName"
                    type="text"
                    required
                    value={couponWaData.fullName}
                    onChange={(e) => setCouponWaData({ ...couponWaData, fullName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005eb8] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="couponWaPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    {t.form.fields.phone} *
                  </label>
                  <input
                    id="couponWaPhone"
                    type="tel"
                    required
                    value={couponWaData.phone}
                    onChange={(e) => setCouponWaData({ ...couponWaData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005eb8] focus:border-transparent outline-none"
                    placeholder="+212 6XX XXX XXX"
                  />
                </div>
                <div>
                  <label htmlFor="couponWaLookingFor" className="block text-sm font-medium text-gray-700 mb-1">
                    {t.form.fields.lookingFor}
                  </label>
                  <select
                    id="couponWaLookingFor"
                    value={couponWaData.lookingFor}
                    onChange={(e) => setCouponWaData({ ...couponWaData, lookingFor: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005eb8] bg-white outline-none"
                  >
                    <option value="">{language === "en" ? "Optional" : "Optionnel"}</option>
                    <option value="stagePFE">{t.form.lookingForOptions.stagePFE}</option>
                    <option value="premierEmploi">{t.form.lookingForOptions.premierEmploi}</option>
                    <option value="progresserCarriere">{t.form.lookingForOptions.progresserCarriere}</option>
                    <option value="reconversion">{t.form.lookingForOptions.reconversion}</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="couponWaOffer" className="block text-sm font-medium text-gray-700 mb-1">
                    {t.form.fields.offer}
                  </label>
                  <select
                    id="couponWaOffer"
                    value={couponWaData.offer}
                    onChange={(e) => setCouponWaData({ ...couponWaData, offer: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005eb8] bg-white outline-none"
                  >
                    <option value="">{language === "en" ? "Optional" : "Optionnel"}</option>
                    <option value={t.form.offerOptions.xperience}>{t.form.offerOptions.xperience}</option>
                    <option value={t.form.offerOptions.xperiencePro}>{t.form.offerOptions.xperiencePro}</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  {language === "en" ? "Open WhatsApp" : "Ouvrir WhatsApp"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCouponWaModal(false)}
                  className="w-full text-gray-600 text-sm font-medium py-2 hover:text-gray-900"
                >
                  {language === "en" ? "Maybe later" : "Peut-être plus tard"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">{t.form.title}</h3>
              <button
                onClick={() => {
                  setShowForm(false)
                  setFormData({ fullName: "", phone: "", lookingFor: "", offer: "", couponCode: "" })
                  setCouponFeedback(null)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
              <p className="text-gray-600 text-sm">{t.form.subtitle}</p>
              
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.form.fields.fullName} *
                </label>
                <input
                  type="text"
                  id="fullName"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005eb8] focus:border-transparent outline-none transition-all"
                  placeholder={t.form.fields.fullName}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.form.fields.phone} *
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005eb8] focus:border-transparent outline-none transition-all"
                  placeholder="+212 6XX XXX XXX"
                />
              </div>

              <div>
                <label htmlFor="lookingFor" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.form.fields.lookingFor} *
                </label>
                <select
                  id="lookingFor"
                  required
                  value={formData.lookingFor}
                  onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005eb8] focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="">{language === "en" ? "Select an option" : "Sélectionnez une option"}</option>
                  <option value="stagePFE">{t.form.lookingForOptions.stagePFE}</option>
                  <option value="premierEmploi">{t.form.lookingForOptions.premierEmploi}</option>
                  <option value="progresserCarriere">{t.form.lookingForOptions.progresserCarriere}</option>
                  <option value="reconversion">{t.form.lookingForOptions.reconversion}</option>
                </select>
              </div>

              <div>
                <label htmlFor="offer" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.form.fields.offer} *
                </label>
                <select
                  id="offer"
                  required
                  value={formData.offer}
                  onChange={(e) => setFormData({ ...formData, offer: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005eb8] focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="">{language === "en" ? "Select an offer" : "Sélectionnez une offre"}</option>
                  <option value={t.form.offerOptions.xperience}>{t.form.offerOptions.xperience}</option>
                  <option value={t.form.offerOptions.xperiencePro}>{t.form.offerOptions.xperiencePro}</option>
                </select>
              </div>

              <div>
                <label htmlFor="couponCode" className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "en" ? "Coupon Code" : "Code coupon"} ({language === "en" ? "optional" : "optionnel"})
                </label>
                <input
                  type="text"
                  id="couponCode"
                  value={formData.couponCode}
                  onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005eb8] focus:border-transparent outline-none transition-all"
                  placeholder={language === "en" ? "Enter coupon code" : "Entrez le code coupon"}
                />
                {couponFeedback && (
                  <p className={`mt-2 text-sm ${couponFeedback.type === "success" ? "text-green-600" : "text-red-600"}`}>
                    {couponFeedback.text}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-[#FFBC00] hover:bg-[#e6a800] text-gray-900 font-bold px-6 py-4 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                {t.form.fields.submit}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

// Roulette Wheel Component
function RouletteWheel({ language }: { language: Language }) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [canSpin, setCanSpin] = useState(true)
  const [winnersToday, setWinnersToday] = useState(0)
  const [timeUntilReset, setTimeUntilReset] = useState("")
  const wheelRef = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState(0)
  const [showWinnerModal, setShowWinnerModal] = useState(false)
  const [winnerData, setWinnerData] = useState<{name: string, prize: string, verificationCode: string} | null>(null)
  const [remainingTries, setRemainingTries] = useState(3)

  const ADMIN_WHATSAPP_NUMBER = "212773213060"
  const MAX_TRIES_PER_DAY = 3
  
  // Clean phone number - remove all non-digit characters
  const cleanPhoneNumber = (phone: string): string => {
    return phone.replace(/\D/g, "")
  }

  // Format time from "HH:MM" to "Xh Ymin"
  const formatTimeUntilReset = (timeStr: string): string => {
    if (!timeStr) return ""
    const parts = timeStr.split(":")
    if (parts.length !== 2) return timeStr
    const hours = parseInt(parts[0], 10)
    const minutes = parseInt(parts[1], 10)
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}min`
    } else if (hours > 0) {
      return `${hours}h`
    } else if (minutes > 0) {
      return `${minutes}min`
    }
    return timeStr
  }
  
  // Send WhatsApp message (for admin)
  const sendWhatsAppMessage = (message: string) => {
    try {
      let cleanedNumber = cleanPhoneNumber(ADMIN_WHATSAPP_NUMBER)
      
      // For WhatsApp Business, ensure proper format
      if (cleanedNumber.startsWith("00212")) {
        cleanedNumber = cleanedNumber.replace("00212", "212")
      }
      if (cleanedNumber.startsWith("+212")) {
        cleanedNumber = cleanedNumber.replace("+212", "212")
      }
      if (cleanedNumber.startsWith("0") && !cleanedNumber.startsWith("212")) {
        cleanedNumber = "212" + cleanedNumber.substring(1)
      }
      if (!cleanedNumber.startsWith("212")) {
        cleanedNumber = "212" + cleanedNumber
      }
      
      // Encode the message for URL
      const encodedMessage = encodeURIComponent(message)
      
      // Use wa.me format (most reliable)
      const whatsappUrl = `https://wa.me/${cleanedNumber}?text=${encodedMessage}`
      
      console.log("Opening WhatsApp URL:", whatsappUrl)
      
      // Open WhatsApp in new window/tab
      window.open(whatsappUrl, "_blank", "noopener,noreferrer")
      
      // Fallback: try alternative format if first fails
      setTimeout(() => {
        const altUrl = `https://api.whatsapp.com/send?phone=${cleanedNumber}&text=${encodedMessage}`
        console.log("Trying alternative WhatsApp URL:", altUrl)
      }, 500)
    } catch (error) {
      console.error("Error sending WhatsApp message:", error)
      // Fallback: show message in console for debugging
      console.log("WhatsApp message that should be sent:", message)
    }
  }

  // Send WhatsApp message from winner to admin (with preset message)
  const sendWinnerWhatsAppMessage = (winnerName: string, prize: string, verificationCode: string) => {
    try {
      let cleanedNumber = cleanPhoneNumber(ADMIN_WHATSAPP_NUMBER)
      
      // Format the number properly
      if (cleanedNumber.startsWith("00212")) {
        cleanedNumber = cleanedNumber.replace("00212", "212")
      }
      if (cleanedNumber.startsWith("+212")) {
        cleanedNumber = cleanedNumber.replace("+212", "212")
      }
      if (cleanedNumber.startsWith("0") && !cleanedNumber.startsWith("212")) {
        cleanedNumber = "212" + cleanedNumber.substring(1)
      }
      if (!cleanedNumber.startsWith("212")) {
        cleanedNumber = "212" + cleanedNumber
      }
      
      // Create preset message for winner
      const winnerMessage = language === "en"
        ? `🎉 Hello! I just won "${prize}" on the roulette!\n\nMy name: ${winnerName}\nVerification Code: ${verificationCode}\n\nI would like to claim my prize.`
        : `🎉 Bonjour ! Je viens de gagner "${prize}" à la roulette !\n\nMon nom : ${winnerName}\nCode de vérification : ${verificationCode}\n\nJe souhaite réclamer mon prix.`
      
      // Encode the message for URL
      const encodedMessage = encodeURIComponent(winnerMessage)
      
      // Use wa.me format
      const whatsappUrl = `https://wa.me/${cleanedNumber}?text=${encodedMessage}`
      
      console.log("Opening WhatsApp for winner:", whatsappUrl)
      
      // Open WhatsApp in new window/tab
      window.open(whatsappUrl, "_blank", "noopener,noreferrer")
    } catch (error) {
      console.error("Error opening WhatsApp for winner:", error)
    }
  }

  // 8 segments: blue = 20% OFF, white = Try Again. Backend: 0,2,4,6 = 20% OFF; 1,3,5,7 = Try Again
  const prizes = [
    { id: 1, label: "OFF Xperience Pro", color: "#005eb8" },  // 0
    { id: 2, label: "Try Again", color: "#ffffff" },          // 1
    { id: 3, label: "OFF Xperience Pro", color: "#005eb8" },  // 2
    { id: 4, label: "Try Again", color: "#ffffff" },          // 3
    { id: 5, label: "OFF Xperience Pro", color: "#005eb8" },  // 4
    { id: 6, label: "Try Again", color: "#ffffff" },          // 5
    { id: 7, label: "OFF Xperience Pro", color: "#005eb8" },  // 6
    { id: 8, label: "Try Again", color: "#ffffff" },           // 7
  ]

  // Initialize and track user tries from localStorage
  useEffect(() => {
    const initializeTries = () => {
      const storageKey = "roulette_tries"
      const lastResetKey = "roulette_last_reset"
      const today = new Date().toDateString()
      
      const lastReset = localStorage.getItem(lastResetKey)
      if (lastReset !== today) {
        // Reset tries for new day
        localStorage.setItem(storageKey, "0")
        localStorage.setItem(lastResetKey, today)
        setRemainingTries(MAX_TRIES_PER_DAY)
      } else {
        // Get remaining tries for today
        const triesUsed = parseInt(localStorage.getItem(storageKey) || "0")
        setRemainingTries(Math.max(0, MAX_TRIES_PER_DAY - triesUsed))
      }
    }
    
    initializeTries()
  }, [])

  // Check daily winners and time until reset
  useEffect(() => {
    const checkDailyStatus = async () => {
      // Check if it's a new day and reset tries if needed
      const storageKey = "roulette_tries"
      const lastResetKey = "roulette_last_reset"
      const today = new Date().toDateString()
      const lastReset = localStorage.getItem(lastResetKey)
      
      if (lastReset !== today) {
        // New day - reset tries
        localStorage.setItem(storageKey, "0")
        localStorage.setItem(lastResetKey, today)
        setRemainingTries(MAX_TRIES_PER_DAY)
      }
      
      try {
        const response = await fetch("/api/roulette/daily-status")
        if (response.ok) {
          const data = await response.json()
          setWinnersToday(data.winnersToday || 0)

          const currentTriesUsed = parseInt(localStorage.getItem(storageKey) || "0")
          const currentRemainingTries = Math.max(0, MAX_TRIES_PER_DAY - currentTriesUsed)
          setRemainingTries(currentRemainingTries)
          setCanSpin(currentRemainingTries > 0 && (data.canSpin !== false))
          if (data.timeUntilReset) {
            setTimeUntilReset(data.timeUntilReset)
          }
        }
      } catch (error) {
        console.error("Error checking daily status:", error)
      }
    }
    checkDailyStatus()
    
    // Update time until reset every minute
    const interval = setInterval(() => {
      checkDailyStatus()
    }, 60000)
    
    return () => clearInterval(interval)
  }, [remainingTries])

  const spinWheel = async () => {
    if (isSpinning || !canSpin || remainingTries <= 0) return

    setIsSpinning(true)
    setResult(null)
    
    // Decrement tries (will be restored if API call fails due to daily limit)
    const storageKey = "roulette_tries"
    const triesUsed = parseInt(localStorage.getItem(storageKey) || "0")
    const newTriesUsed = triesUsed + 1
    localStorage.setItem(storageKey, newTriesUsed.toString())
    const previousRemainingTries = remainingTries
    setRemainingTries(Math.max(0, MAX_TRIES_PER_DAY - newTriesUsed))

    try {
      const response = await fetch("/api/roulette/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        const error = await response.json()
        // If error is due to daily limit or already won, restore the try
        if (response.status === 429 || response.status === 403 || error.error === "Daily limit reached" || error.error === "Already won today") {
          localStorage.setItem(storageKey, triesUsed.toString())
          setRemainingTries(previousRemainingTries)
        }
        alert(error.message || (language === "en" ? "Unable to spin. Try again later." : "Impossible de tourner. Réessayez plus tard."))
        setIsSpinning(false)
        return
      }

      const data = await response.json()
      const prizeIndex = data.prizeIndex
      const selectedPrize = prizes[prizeIndex]

      console.log("Spinning to prize index:", prizeIndex, "Prize:", selectedPrize.label, "Backend prize:", data.prize)

      // Calculate rotation to align segment center with top pointer
      // To align center with top (0deg), rotate wheel by: 360 - (prizeIndex * 30 + 15)
      const fullSpins = 5
      const segmentAngle = 360 / prizes.length
      const segmentCenterAngle = prizeIndex * segmentAngle + segmentAngle / 2
      
      // Target rotation (normalized): position where segment center aligns with top
      const targetRotationNormalized = (360 - segmentCenterAngle) % 360
      
      // Current rotation (normalized)
      const currentNormalized = rotation % 360
      
      // Calculate rotation needed to reach target from current position
      let rotationDelta = targetRotationNormalized - currentNormalized
      if (rotationDelta <= 0) {
        rotationDelta += 360 // Always rotate forward (clockwise)
      }
      
      // Final rotation: current + full spins + delta to target
      const finalRotation = rotation + (fullSpins * 360) + rotationDelta

      console.log("Rotation calculation:", {
        prizeIndex,
        segmentCenterAngle: segmentCenterAngle.toFixed(1),
        targetRotationNormalized: targetRotationNormalized.toFixed(1),
        currentNormalized: currentNormalized.toFixed(1),
        rotationDelta: rotationDelta.toFixed(1),
        finalRotation: finalRotation.toFixed(1),
        finalNormalized: (finalRotation % 360).toFixed(1)
      })

      setRotation(finalRotation)

      // Show result after animation
      setTimeout(async () => {
        // Check if this is actually a win (not "Try Again")
        const isActualWin = data.prize && data.prize !== "Try Again" && data.verificationCode
        const displayResult = isActualWin ? data.prize : selectedPrize.label
        
        setResult(displayResult)
        setIsSpinning(false)
        
        // Only increment winners count if it's an actual win
        if (isActualWin) {
          setWinnersToday(data.winnersToday || winnersToday + 1)
        }
        
        const storageKey = "roulette_tries"
        const currentTriesUsed = parseInt(localStorage.getItem(storageKey) || "0")
        const currentRemainingTries = Math.max(0, MAX_TRIES_PER_DAY - currentTriesUsed)
        setCanSpin(currentRemainingTries > 0 && (data.canSpin !== false))
        
        // Update remainingTries state to match localStorage
        setRemainingTries(currentRemainingTries)
        
        // Only process actual prizes (Free CV Correction and 20% OFF) - not "Try Again"
        console.log("Roulette result:", { 
          backendPrize: data.prize, 
          verificationCode: data.verificationCode, 
          selectedPrizeLabel: selectedPrize.label,
          isActualWin: isActualWin
        })
        
        const isTryAgainSegment = selectedPrize.label === "Try Again"
        if (data.verificationCode && data.prize && data.prize !== "Try Again" && !isTryAgainSegment) {
          console.log("Processing winner with prize:", data.prize)
          
          // Prompt for name first
          let winnerName = prompt(
            language === "en" 
              ? "🎉 Congratulations! Please enter your name to claim your prize:" 
              : "🎉 Félicitations ! Veuillez entrer votre nom pour réclamer votre prix :"
          )
          
          // If user cancels or doesn't enter name, ask again
          if (!winnerName || !winnerName.trim()) {
            winnerName = prompt(
              language === "en" 
                ? "⚠️ Name is required. Please enter your name:" 
                : "⚠️ Le nom est requis. Veuillez entrer votre nom :"
            )
          }
          
          // Update winner with name if provided
          if (winnerName && winnerName.trim()) {
            try {
              console.log("Updating winner name:", winnerName.trim())
              const updateResponse = await fetch("/api/roulette/update-winner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  verificationCode: data.verificationCode,
                  winnerName: winnerName.trim()
                })
              })
              
              if (!updateResponse.ok) {
                console.error("Failed to update winner name")
              }
              
              // Send WhatsApp message to ADMIN with winner info
              const adminMessage = language === "en"
                ? `🎰 *Roulette Winner*\n\n*Name:* ${winnerName.trim()}\n*Prize:* ${data.prize}\n*Verification Code:* ${data.verificationCode}\n\nPlease verify and process this winner.`
                : `🎰 *Gagnant de la Roulette*\n\n*Nom:* ${winnerName.trim()}\n*Prix:* ${data.prize}\n*Code de vérification:* ${data.verificationCode}\n\nVeuillez vérifier et traiter ce gagnant.`
              
              console.log("Sending WhatsApp message to admin:", adminMessage)
              // Send message to admin (this opens WhatsApp for admin to receive the message)
              sendWhatsAppMessage(adminMessage)
              
              // Store winner data and show beautiful congratulations modal
              setWinnerData({
                name: winnerName.trim(),
                prize: data.prize,
                verificationCode: data.verificationCode
              })
              setShowWinnerModal(true)
            } catch (error) {
              console.error("Error updating winner name or sending WhatsApp:", error)
              alert(
                language === "en" 
                  ? "An error occurred. Please contact us with your verification code: " + data.verificationCode
                  : "Une erreur s'est produite. Veuillez nous contacter avec votre code de vérification : " + data.verificationCode
              )
            }
          } else {
            // If still no name, show error
            alert(
              language === "en"
                ? "Name is required to claim your prize. Please contact us with your verification code: " + data.verificationCode
                : "Le nom est requis pour réclamer votre prix. Veuillez nous contacter avec votre code de vérification : " + data.verificationCode
            )
          }
        } else {
          console.log("No prize won - Try Again result", { backendPrize: data.prize, selectedPrizeLabel: selectedPrize.label })
        }
        
        // Try Again doesn't show alert
        
        // Refresh daily status after spin to ensure state is up to date
        try {
          const statusResponse = await fetch("/api/roulette/daily-status")
          if (statusResponse.ok) {
            const statusData = await statusResponse.json()
            setWinnersToday(statusData.winnersToday || 0)
            const storageKey = "roulette_tries"
            const currentTriesUsed = parseInt(localStorage.getItem(storageKey) || "0")
            setRemainingTries(Math.max(0, MAX_TRIES_PER_DAY - currentTriesUsed))
            setCanSpin(Math.max(0, MAX_TRIES_PER_DAY - currentTriesUsed) > 0 && (statusData.canSpin !== false))
            if (statusData.timeUntilReset) setTimeUntilReset(statusData.timeUntilReset)
          }
        } catch (statusError) {
          console.error("Error refreshing daily status after spin:", statusError)
        }
      }, 4000)
    } catch (error) {
      console.error("Error spinning wheel:", error)
      setIsSpinning(false)
      alert(language === "en" ? "An error occurred. Please try again." : "Une erreur s'est produite. Veuillez réessayer.")
    }
  }

  const prizeAngle = 360 / prizes.length

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Modern Roulette Wheel Container */}
      <div className="relative">
        {/* Pointer - Xperience blue */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-30">
          <div className="relative">
            <div className="absolute inset-0 bg-[#005eb8] blur-md opacity-40 animate-pulse"></div>
            <div className="relative">
              <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[32px] border-l-transparent border-r-transparent border-t-[#FFBC00] drop-shadow-lg"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-white/30"></div>
            </div>
          </div>
        </div>

        {/* Modern Wheel Container */}
        <div className="relative w-[300px] h-[300px] md:w-[360px] md:h-[360px]">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#005eb8]/20 via-[#FFBC00]/10 to-[#0476D7]/20 blur-xl"></div>
          
          {/* Main wheel - Clean modern design */}
          <div className="relative w-full h-full">
            <div
              ref={wheelRef}
              className="w-full h-full rounded-full relative overflow-hidden border-8 border-white/95 shadow-2xl"
              style={{
                background: "conic-gradient(" +
                  prizes.map((prize, index) => {
                    const startAngle = index * prizeAngle
                    const endAngle = (index + 1) * prizeAngle
                    return `${prize.color} ${startAngle}deg ${endAngle}deg`
                  }).join(", ") +
                ")",
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
              }}
            >

              {/* Prize Labels - Directly on wheel segments at outer rim */}
              {prizes.map((prize, index) => {
                const angle = (index * prizeAngle) + (prizeAngle / 2) - 90
                // Position text on outer rim (around 85% from center, near the white border)
                const radius = 85
                const x = 50 + radius * Math.cos((angle * Math.PI) / 180)
                const y = 50 + radius * Math.sin((angle * Math.PI) / 180)

                const labelText = prize.label === "OFF Xperience Pro"
                  ? (language === "en" ? "20% OFF" : "20% OFF")
                  : (language === "en" ? "Try Again" : "Réessayer")

                const isWhiteSegment = prize.color === "#ffffff"
                return (
                  <div
                    key={prize.id}
                    className="absolute pointer-events-none z-20"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`,
                      transformOrigin: "center",
                      width: "18%",
                    }}
                  >
                    <div className="text-center">
                      <div 
                        className={`text-[10px] md:text-xs leading-tight whitespace-nowrap ${isWhiteSegment ? "text-[#005eb8] font-semibold" : "text-white"}`}
                        style={isWhiteSegment ? { textShadow: "0 1px 2px rgba(255,255,255,0.8)" } : {
                          textShadow: "2px 2px 4px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.7)",
                          filter: "drop-shadow(0 0 2px rgba(0,0,0,0.8))",
                        }}
                      >
                        {labelText}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Center button - Xperience */}
              <button
                onClick={spinWheel}
                disabled={isSpinning || !canSpin}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#005eb8] to-[#0476D7] rounded-full border-4 border-white shadow-xl flex items-center justify-center z-10 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="text-center">
                  <div className="text-xl md:text-2xl">🎰</div>
                  <div className="text-[9px] md:text-[10px] text-white tracking-wider font-semibold">SPIN</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spin Button - Xperience */}
      <button
        onClick={spinWheel}
        disabled={isSpinning || !canSpin}
        className={`
          relative px-10 py-4 rounded-2xl font-bold text-base md:text-lg shadow-lg
          transform transition-all duration-200 overflow-hidden min-w-[200px]
          ${isSpinning || !canSpin
            ? "bg-gray-500/80 cursor-not-allowed text-white/70"
            : "bg-gradient-to-r from-[#005eb8] to-[#0476D7] hover:from-[#0476D7] hover:to-[#005eb8] hover:scale-105 active:scale-95 text-white shadow-[0_4px_20px_rgba(0,94,184,0.3)]"
          }
        `}
      >
        {/* Button glow for enabled state */}
        {!isSpinning && canSpin && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        )}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isSpinning 
            ? (
              <>
                <div className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin"></div>
                <span>{language === "en" ? "Spinning..." : "En cours..."}</span>
              </>
            )
            : !canSpin
            ? (remainingTries <= 0
                ? (language === "en" ? "No More Tries" : "Plus de Tentatives")
                : (language === "en" ? "Can't Spin" : "Impossible de Tourner"))
            : (
              <>
                <span className="text-xl">🎰</span>
                <span>{language === "en" ? "Spin Now" : "Tournez Maintenant"}</span>
              </>
            )
          }
        </span>
      </button>

      {/* Modern Status Info - Clean & Minimal */}
      <div className="text-center space-y-4 w-full max-w-2xl">
        {result && result !== "Try Again" && (
          <div className="bg-gradient-to-r from-[#0476D7] to-[#005eb8] text-white px-6 py-3 rounded-2xl text-base md:text-lg shadow-lg animate-pulse">
            {language === "en" ? `🎉 You won: ${result}!` : `🎉 Vous avez gagné : ${result} !`}
          </div>
        )}

        {remainingTries <= 0 && (
          <div className="bg-white/20 backdrop-blur-sm text-white px-6 py-4 rounded-2xl text-sm md:text-base shadow-lg border border-white/30">
            {language === "en"
              ? `⏰ You've used all ${MAX_TRIES_PER_DAY} tries for today! Come back tomorrow.`
              : `⏰ Vous avez utilisé toutes vos ${MAX_TRIES_PER_DAY} tentatives aujourd'hui ! Revenez demain.`}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl shadow-md border border-white/20">
            <div className="text-xs md:text-sm text-white/80 mb-1">
              {language === "en" ? "Winners Today" : "Gagnants Aujourd'hui"}
            </div>
            <div className="text-lg md:text-xl text-white">{winnersToday}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl shadow-md border border-white/20">
            <div className="text-xs md:text-sm text-white/80 mb-1">
              {language === "en" ? "Your Tries" : "Vos Tentatives"}
            </div>
            <div className="text-lg md:text-xl text-white">
              {remainingTries}/{MAX_TRIES_PER_DAY}
            </div>
          </div>
          {timeUntilReset && (
            <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl shadow-md border border-white/20 col-span-2 md:col-span-1">
              <div className="text-xs md:text-sm text-white/80 mb-1">
                {language === "en" ? "Resets in" : "Réinitialisation dans"}
              </div>
              <div className="text-lg md:text-xl text-white">
                {formatTimeUntilReset(timeUntilReset)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Winner Congratulations Modal */}
      {showWinnerModal && winnerData && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setShowWinnerModal(false)}
        >
          <div 
            className="bg-gradient-to-br from-[#005eb8] via-[#0476D7] to-[#0068A7] rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowWinnerModal(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Confetti/Sparkles effect */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
              <div className="absolute top-0 left-1/4 w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }}></div>
              <div className="absolute top-0 right-1/4 w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2s' }}></div>
              <div className="absolute bottom-0 left-1/3 w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '2s' }}></div>
              <div className="absolute bottom-0 right-1/3 w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2s' }}></div>
            </div>

            {/* Content */}
            <div className="text-center relative z-10">
              {/* Trophy/Confetti Icon */}
              <div className="text-7xl mb-4 animate-bounce">
                🎉
              </div>
              
              {/* Title */}
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3 drop-shadow-lg">
                {language === "en" ? "Congratulations!" : "Félicitations !"}
              </h2>
              
              {/* Winner Name */}
              <p className="text-xl md:text-2xl font-bold text-white mb-4 drop-shadow-md">
                {winnerData.name} 🎊
              </p>
              
              {/* Prize */}
              <div className="bg-white/95 rounded-2xl p-4 mb-4 shadow-xl">
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  {language === "en" ? "You won:" : "Vous avez gagné :"}
                </p>
                <p className="text-xl md:text-2xl text-[#005eb8] font-bold">
                  {winnerData.prize}
                </p>
              </div>
              
              {/* Verification Code */}
              <div className="bg-white/95 rounded-xl p-3 mb-6 shadow-lg">
                <p className="text-xs font-semibold text-gray-600 mb-1">
                  {language === "en" ? "Verification Code:" : "Code de vérification :"}
                </p>
                <p className="text-2xl font-black text-gray-900 font-mono tracking-wider">
                  {winnerData.verificationCode}
                </p>
              </div>

              {/* WhatsApp Button */}
              <button
                onClick={() => {
                  sendWinnerWhatsAppMessage(winnerData.name, winnerData.prize, winnerData.verificationCode)
                  setShowWinnerModal(false)
                }}
                className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-black py-4 px-6 rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 mb-3"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span className="text-lg">
                  {language === "en" ? "Contact us on WhatsApp" : "Contactez-nous sur WhatsApp"}
                </span>
              </button>

              {/* Info text */}
              <p className="text-sm text-white/90 font-medium">
                {language === "en" 
                  ? "Click the button above to send us a message with your verification code"
                  : "Cliquez sur le bouton ci-dessus pour nous envoyer un message avec votre code de vérification"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

