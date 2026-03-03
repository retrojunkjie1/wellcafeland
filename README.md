# WellnessCafe 🌿

> Transforming lives through compassionate wellness technology

WellnessCafe is a comprehensive wellness platform that combines ancient healing wisdom with modern AI technology to support recovery, mindfulness, and holistic well-being. Our platform connects clients with verified wellness practitioners and provides AI-powered tools for mental health, addiction recovery, and personal growth.

## 🌟 Features

### For Clients
- **🧠 AI-Powered Recovery Support** - Advanced progress tracking, relapse prevention, and personalized coping strategies
- **🧘 Yoga & Mindfulness** - Guided movement, breathwork, and meditation practices
- **🌿 Acuwellness** - Traditional Chinese medicine, acupuncture, and Eastern healing modalities
- **🙏 Spiritual Counseling** - Personal and group spiritual guidance and transformation
- **👥 Community Events** - Live wellness workshops, support groups, and retreats
- **🏛️ Government Assistance** - Navigate financial aid, housing, healthcare, and recovery programs
- **📊 Daily Check-ins** - Track mood, energy, stress, and sleep with intelligent insights

### For Practitioners
- **💼 Flexible Scheduling** - Set your own availability and work remotely
- **🌟 Build Your Practice** - Expand your client base through our wellness community
- **🤝 Professional Network** - Connect with peers and collaborate
- **💰 Competitive Rates** - Set your own pricing and maximize earnings
- **🔒 HIPAA Compliant** - Secure, compliant platform for client data

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/wellcafeland.git
cd wellcafeland

# Install dependencies
npm install

# Start development server
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## 📋 Prerequisites

- **Node.js** v14+ (v22.17.0 recommended)
- **npm** v6+ or yarn
- **Firebase account** for backend services
- **Git** for version control

## 🛠️ Installation

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/wellcafeland.git
cd wellcafeland
npm install
```

### 2. Firebase Configuration

Create `.env.local` in the project root:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 3. Start Development

```bash
npm run dev
```

#### LAN access (mobile / other devices)

```bash
# Start dev server bound to 0.0.0.0 (LAN reachable)
npm run dev:lan

# Kill stale processes on dev ports, then start
npm run dev:lan:clean
```

Expect Vite to print:
- `Local: http://localhost:5173`
- `Network: http://192.168.x.x:5173`

Confirm LAN is reachable from another device. Proxy (`/api` → functions) is unchanged.

```bash
# List processes on dev ports
npm run ports
```

## 📁 Project Structure

```
wellcafeland/
├── public/                 # Static assets
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Navbar.js
│   │   ├── Footer.js
│   │   ├── CheckIn.js
│   │   └── ContactPage.js
│   ├── features/          # Feature modules
│   │   ├── auth/         # Authentication
│   │   └── providers/    # Provider features
│   ├── Views/            # Page components
│   │   ├── HomePage.js
│   │   ├── Recovery.js
│   │   ├── Yoga.js
│   │   ├── Acuwellness.js
│   │   ├── Spiritual.js
│   │   ├── Events.js
│   │   └── Assistance.js
│   ├── styles/           # CSS stylesheets
│   ├── utils/            # Utility functions
│   ├── App.js            # Main app component
│   ├── AuthContext.js    # Authentication context
│   └── firebase.js       # Firebase config
├── .env.example          # Environment template
├── firebase.json         # Firebase configuration
├── package.json          # Dependencies
└── README.md            # This file
```

## 🔑 Key Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | HomePage | Landing page with features |
| `/recovery` | Recovery | Addiction recovery tools |
| `/yoga` | Yoga | Yoga and mindfulness |
| `/acuwellness` | Acuwellness | Eastern medicine |
| `/spiritual` | Spiritual | Spiritual counseling |
| `/events` | Events | Community events |
| `/assistance` | Assistance | Government aid navigation |
| `/providers` | ProvidersPage | Provider directory |
| `/providers/apply` | ProviderSignup | Provider application |
| `/dashboard` | Dashboard | User dashboard (protected) |
| `/about` | AboutPage | About WellnessCafe |
| `/contact` | ContactPage | Contact information |

## 🔒 Security & Compliance

- **HIPAA Compliant** - Full PHI protection
- **42 CFR Part 2** - Substance use disorder compliance
- **End-to-End Encryption** - All communications encrypted
- **Firebase Authentication** - Secure Google Sign-In
- **Data Privacy** - User-controlled data management

## 📜 Available Scripts

```bash
npm start          # Start development server (port 3000)
npm run build      # Build production bundle
npm test           # Run test suite
npm run eject      # Eject from Create React App
```

## 🚀 Deployment

### Firebase Hosting

```bash
# Build production bundle
npm run build

# Deploy to Firebase
firebase deploy
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 👥 For Providers

### Join Our Network

1. Visit `/providers/apply`
2. Complete verification process
3. Set up profile and availability
4. Start accepting clients (24-48 hours)

### Benefits
- Remote work flexibility
- Competitive earnings
- Professional community
- Marketing support
- HIPAA-compliant platform

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

```bash
# Fork and clone
git checkout -b feature/AmazingFeature
git commit -m 'Add AmazingFeature'
git push origin feature/AmazingFeature
# Open Pull Request
```

## 📊 Project Stats

- **500+** Active Practitioners
- **10,000+** Sessions Completed
- **50+** Service Modalities
- **95%** Client Satisfaction

## 📞 Contact

- **Website**: [wellnesscafe.com](https://wellnesscafe.com)
- **Email**: info@wellnesscafe.com
- **Provider Support**: providers@wellnesscafe.com
- **Client Services**: clients@wellnesscafe.com
- **Phone**: 1-800-WELLNESS (1-800-935-5677)

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Backend: [Firebase](https://firebase.google.com/)
- Hosting: Firebase Hosting
- Icons: Various open-source projects

---

**WellnessCafe** - *Clarity. Balance. Precision.*

Discover calm intelligence through design, ritual, and mindful innovation.
