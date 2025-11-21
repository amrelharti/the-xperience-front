"use client"

import { useState, useEffect, useRef } from "react"
import { CheckCircle2, ArrowRight, PlayCircle, Users, Target, FileText, Linkedin, MessageSquare, Calendar, ChevronDown, Instagram, Award, TrendingUp, Clock, Sparkles } from "lucide-react"

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
    reasons: {
      number: string
      title: string
      description: string
    }[]
  }
  trainer: {
    title: string
    name: string
    role: string
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
    points: string[]
  }
  whoItsFor: {
    title: string
    points: string[]
  }
  price: {
    title: string
    amount: string
    description: string
    cta: string
    included: string
  }
  faq: {
    title: string
    items: {
      question: string
      answer: string
    }[]
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
      headline: "Xperience Pro: Stop applying in the dark. Start getting real interviews.",
      subheading: "A step-by-step program to build a winning CV, adapt it to each job, master LinkedIn, and feel confident in interviews.",
      forWho: "For students, employees, and job seekers who are tired of sending CVs and getting no answers.",
      ctaPrimary: "Join Xperience Pro – 1000 DH",
      ctaSecondary: "See what's inside",
    },
    socialProof: {
      title: "Proven Method",
      stats: [
        { number: "+5000", label: "candidates accompanied" },
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
    trainer: {
      title: "Meet your coach",
      name: "Ali El Harti",
      role: "Certified Trainer & Employability Manager",
      bio: [
        "Certified trainer with 7+ years of experience helping young people prepare for the job market.",
        "Specializes in job and internship search techniques.",
        "More than 5000 people have benefited from his career coaching.",
        "Has spoken in over 100 conferences in Morocco and internationally.",
        "Works as an Employability Manager and collaborates with several well-known universities in Morocco, focusing on company relations and industrial partnerships.",
        "Has been invited by major media such as Al Aoula, Le Matin, and M24.",
      ],
      stats: [
        { label: "Years of Experience", value: "7+" },
        { label: "People Coached", value: "5000+" },
        { label: "Conferences", value: "100+" },
      ],
      social: {
        instagram: "https://instagram.com",
        linkedin: "https://linkedin.com",
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
          title: "Module 1 – CV fundamentals",
          description: "Build a CV that looks professional and clearly shows your value, even if you don't have a lot of experience.",
        },
        {
          title: "Module 2 – Adapting your CV to each job",
          description: "How to read a job offer, pick the right keywords, and adapt your CV fast.",
        },
        {
          title: "Module 3 – Mastering LinkedIn",
          description: "Optimize your photo, headline, About section, and start being visible to recruiters.",
        },
        {
          title: "Module 4 – Interview preparation",
          description: "How to introduce yourself, answer classic questions, and ask smart questions at the end.",
        },
        {
          title: "Module 5 – Action plan",
          description: "A 30-day action plan to apply, follow up, and track your progress without feeling lost.",
        },
      ],
    },
    platform: {
      title: "Learn on a simple, 24/7 online platform",
      points: [
        "All lessons are available on an online platform.",
        "Short videos, practical exercises, and progress tracking.",
      ],
    },
    whoItsFor: {
      title: "Xperience Pro is for you if…",
      points: [
        "You're a student, employee, or job seeker.",
        "You're tired of sending CVs and hearing nothing back.",
        "You want a clear structure instead of random YouTube videos.",
      ],
    },
    price: {
      title: "Join Xperience Pro today",
      amount: "1000 DH",
      description: "One-time payment",
      cta: "Join Xperience Pro – 1000 DH",
      included: "Full access to all 5 modules, video lessons, exercises, and lifetime access to the platform.",
    },
    faq: {
      title: "Frequently Asked Questions",
      items: [
        {
          question: "How do I access the program after payment?",
          answer: "After payment, you'll receive an email with your login credentials and access to the online platform within 24 hours.",
        },
        {
          question: "Is it suitable for beginners?",
          answer: "Yes! Xperience Pro is designed for everyone, whether you're just starting your career or looking to make a change. No prior experience needed.",
        },
        {
          question: "How long do I keep access?",
          answer: "You get lifetime access to all the content. Once you join, you can revisit the lessons anytime, anywhere.",
        },
        {
          question: "What if I'm not satisfied?",
          answer: "We're confident you'll love the program. If you're not satisfied within the first 7 days, contact us for a full refund.",
        },
        {
          question: "Can I access it on mobile?",
          answer: "Yes! The platform is fully responsive and works perfectly on your phone, tablet, or computer.",
        },
      ],
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
      headline: "Xperience Pro : Arrête de postuler dans le vide. Commence à décrocher de vrais entretiens.",
      subheading: "Un programme étape par étape pour créer un CV qui donne envie de te rencontrer, l'adapter à chaque offre, maîtriser LinkedIn et arriver préparé(e) en entretien.",
      forWho: "Pour les étudiants, salariés et personnes en recherche d'emploi qui en ont marre d'envoyer des CV sans aucune réponse.",
      ctaPrimary: "Rejoindre Xperience Pro – 1000 DH",
      ctaSecondary: "Découvrir le programme",
    },
    socialProof: {
      title: "Méthode éprouvée",
      stats: [
        { number: "+5000", label: "candidats accompagnés" },
        { number: "92%", label: "ont atteint leurs objectifs professionnels" },
        { number: "80%", label: "l'ont fait en moins de 3 mois" },
      ],
    },
    problem: {
      title: "3 raisons pour lesquelles tu n'atteins pas tes objectifs professionnels",
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
    trainer: {
      title: "Préparez-vous au marché d'emploi avec notre expert",
      name: "Ali El Harti",
      role: "Formateur Certifié & Responsable Employabilité",
      bio: [
        "Formateur certifié avec plus de 7 ans d'expérience dans l'accompagnement des jeunes vers le marché de l'emploi.",
        "Spécialisé dans les techniques de recherche d'emploi et de stage.",
        "Plus de 5000 personnes ont bénéficié de son coaching de carrière.",
        "A animé plus de 100 conférences au Maroc et à l'international.",
        "Travaille en tant que Responsable Employabilité et collabore avec plusieurs universités reconnues au Maroc, axé sur les relations entreprises et partenariats industriels.",
        "A été invité par les grands médias tels qu'Al Aoula, Le Matin et M24.",
      ],
      stats: [
        { label: "Années d'expérience", value: "7+" },
        { label: "Personnes coachées", value: "5000+" },
        { label: "Conférences", value: "100+" },
      ],
      social: {
        instagram: "https://instagram.com",
        linkedin: "https://linkedin.com",
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
          title: "Module 1 – Les fondamentaux du CV",
          description: "Construire un CV professionnel qui met en valeur ton profil, même si tu n'as pas beaucoup d'expérience.",
        },
        {
          title: "Module 2 – Adapter ton CV à chaque offre",
          description: "Comment lire une offre, choisir les bons mots-clés et adapter ton CV rapidement.",
        },
        {
          title: "Module 3 – Maîtriser LinkedIn",
          description: "Optimiser ta photo, ton titre, ton 'À propos' et devenir visible pour les recruteurs.",
        },
        {
          title: "Module 4 – Préparation aux entretiens",
          description: "Comment te présenter, répondre aux questions classiques et poser des questions intelligentes en fin d'entretien.",
        },
        {
          title: "Module 5 – Plan d'action",
          description: "Un plan d'action sur 30 jours pour postuler, relancer et suivre tes candidatures sans te perdre.",
        },
      ],
    },
    platform: {
      title: "Une plateforme simple, accessible 24h/24",
      points: [
        "Tous les modules sont disponibles sur une plateforme en ligne.",
        "Vidéos courtes, exercices pratiques et suivi de progression.",
      ],
    },
    whoItsFor: {
      title: "Xperience Pro est fait pour toi si…",
      points: [
        "Tu es étudiant(e), salarié(e) ou en recherche d'emploi.",
        "Tu en as marre d'envoyer des CV sans réponse.",
        "Tu veux un cadre clair au lieu de vidéos YouTube au hasard.",
      ],
    },
    price: {
      title: "Rejoins Xperience Pro dès aujourd'hui",
      amount: "1000 DH",
      description: "Paiement unique",
      cta: "Rejoindre Xperience Pro – 1000 DH",
      included: "Accès complet aux 5 modules, leçons vidéo, exercices et accès à vie à la plateforme.",
    },
    faq: {
      title: "Questions fréquentes",
      items: [
        {
          question: "Comment j'accède au programme après le paiement ?",
          answer: "Après le paiement, tu recevras un email avec tes identifiants de connexion et l'accès à la plateforme en ligne sous 24 heures.",
        },
        {
          question: "Est-ce adapté aux débutants ?",
          answer: "Oui ! Xperience Pro est conçu pour tout le monde, que tu commences ta carrière ou que tu veuilles changer. Aucune expérience préalable nécessaire.",
        },
        {
          question: "Combien de temps je garde l'accès ?",
          answer: "Tu as un accès à vie à tout le contenu. Une fois inscrit(e), tu peux revoir les leçons quand tu veux, où tu veux.",
        },
        {
          question: "Et si je ne suis pas satisfait(e) ?",
          answer: "Nous sommes confiants que tu vas adorer le programme. Si tu n'es pas satisfait(e) dans les 7 premiers jours, contacte-nous pour un remboursement complet.",
        },
        {
          question: "Je peux y accéder sur mobile ?",
          answer: "Oui ! La plateforme est entièrement responsive et fonctionne parfaitement sur ton téléphone, tablette ou ordinateur.",
        },
      ],
    },
  },
}

export default function XperienceProLandingPage() {
  const [language, setLanguage] = useState<Language>("en")
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({})

  const t = content[language]

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

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#005eb8] to-[#0476D7] bg-clip-text text-transparent">
                {t.header.logo}
              </h1>
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
            </div>
          </div>
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
              {t.hero.headline}
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-blue-100 leading-relaxed">
              {t.hero.subheading}
            </p>
            <p className="text-lg mb-8 text-blue-200">
              {t.hero.forWho}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => scrollToSection("price")}
                className="bg-[#FFBC00] hover:bg-[#e6a800] text-gray-900 font-bold px-8 py-4 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                {t.hero.ctaPrimary}
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollToSection("program")}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-lg text-lg border-2 border-white/30 transition-all duration-200 flex items-center gap-2"
              >
                {t.hero.ctaSecondary}
                <PlayCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-12 md:py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900">
            {t.socialProof.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {t.socialProof.stats.map((stat, index) => (
              <div
                key={index}
                ref={(el) => {
                  sectionRefs.current[`stat-${index}`] = el
                }}
                className={`bg-gradient-to-br from-[#005eb8] to-[#0476D7] p-8 rounded-2xl shadow-xl text-white text-center transform transition-all duration-700 ${
                  visibleSections.has(`stat-${index}`)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-5xl md:text-6xl font-bold mb-2 text-[#FFBC00]">
                  {stat.number}
                </div>
                <div className="text-lg md:text-xl font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              {t.problem.title}
            </h2>
            <div className="space-y-6">
              {t.problem.reasons.map((reason, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    sectionRefs.current[`problem-${index}`] = el
                  }}
                  className={`bg-white p-8 rounded-xl shadow-lg border-l-4 border-red-500 transform transition-all duration-700 ${
                    visibleSections.has(`problem-${index}`)
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-10"
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="bg-red-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">
                        {reason.number}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                        {reason.title}
                      </h3>
                      <p className="text-lg text-gray-600 leading-relaxed">{reason.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

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
                  <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-6 border-4 border-white/30">
                    <Users className="w-16 h-16 text-white" />
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

      {/* Transformation Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              {t.transformation.title}
            </h2>
            <div className="space-y-4">
              {t.transformation.points.map((point, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    sectionRefs.current[`transformation-${index}`] = el
                  }}
                  className={`bg-gradient-to-r from-[#005eb8] to-[#0476D7] p-6 rounded-lg shadow-lg text-white flex items-start gap-4 transform transition-all duration-700 ${
                    visibleSections.has(`transformation-${index}`)
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-10"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CheckCircle2 className="w-6 h-6 mt-1 flex-shrink-0 text-[#FFBC00]" />
                  <p className="text-lg flex-1">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="program" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            {t.modules.title}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <p className="text-gray-600 leading-relaxed">{module.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
              {t.platform.title}
            </h2>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-lg">
              <div className="space-y-4">
                {t.platform.points.map((point, index) => (
                  <div key={index} className="flex items-center gap-3 text-left">
                    <CheckCircle2 className="w-6 h-6 text-[#005eb8] flex-shrink-0" />
                    <p className="text-lg text-gray-700">{point}</p>
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
        className="py-16 md:py-24 bg-gradient-to-br from-[#005eb8] via-[#0476D7] to-[#0068A7] text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)'
          }}></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div
            className={`text-center mb-12 transform transition-all duration-700 ${
              visibleSections.has("price") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.price.title}</h2>
            <div className="mb-6">
              <div className="text-6xl md:text-7xl font-bold mb-2 text-[#FFBC00]">{t.price.amount}</div>
              <p className="text-xl text-blue-200">{t.price.description}</p>
            </div>
            <p className="text-lg text-blue-100 mb-8">{t.price.included}</p>
          </div>
          <div
            className={`bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-white/20 transform transition-all duration-700 ${
              visibleSections.has("price") ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <div className="text-center">
              <button
                onClick={() => {
                  // TODO: Add payment integration
                  alert(language === "en" ? "Payment integration coming soon!" : "Intégration de paiement à venir !")
                }}
                className="bg-[#FFBC00] hover:bg-[#e6a800] text-gray-900 font-bold px-12 py-5 rounded-lg text-xl shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3 mx-auto animate-pulse hover:animate-none"
              >
                {t.price.cta}
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-24 bg-white">
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#FFBC00] to-[#e6a800] bg-clip-text text-transparent">
            {t.header.logo}
          </h3>
          <p className="text-gray-400">
            {language === "en"
              ? "Transform your job search. Get real results."
              : "Transforme ta recherche d'emploi. Obtiens de vrais résultats."}
          </p>
        </div>
      </footer>
    </div>
  )
}

