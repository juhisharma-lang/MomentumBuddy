export interface WeekTemplate {
  week: number;
  title: string;
  goals: string[];
}

export interface Journey {
  id: string;
  name: string;
  category: string;
  icon: string;
  weeksMin: number;
  weeksMax: number;
  available: boolean;
  tileColor: string;
  weeks: WeekTemplate[];
}

// ── Journey 1: AI / ML Fundamentals ──────────────────────────────────────────

const aiml: Journey = {
  id: 'aiml',
  name: 'AI / ML Fundamentals',
  category: 'AI & Machine Learning',
  icon: 'BrainCircuit',
  weeksMin: 8,
  weeksMax: 16,
  available: true,
  tileColor: 'bg-[#e0f2f1]',
  weeks: [
    {
      week: 1,
      title: 'Python foundations for ML',
      goals: [
        'Set up Python environment with Jupyter, NumPy, and Pandas',
        'Understand arrays, DataFrames, and basic data manipulation',
        'Load and explore a real dataset (e.g. Titanic or Iris)',
        'Write your first data summary and visualisation with Matplotlib',
      ],
    },
    {
      week: 2,
      title: 'Core ML concepts',
      goals: [
        'Understand supervised vs unsupervised vs reinforcement learning',
        'Learn the ML workflow: data → model → train → evaluate → iterate',
        'Study the bias-variance tradeoff and overfitting',
        'Complete Andrew Ng\'s intro to ML week 1–2 (Coursera)',
      ],
    },
    {
      week: 3,
      title: 'Regression and classification',
      goals: [
        'Implement linear regression from scratch and with scikit-learn',
        'Build a logistic regression classifier on a real dataset',
        'Understand precision, recall, F1 score, and confusion matrix',
        'Complete your first end-to-end classification project',
      ],
    },
    {
      week: 4,
      title: 'Tree models and ensembles',
      goals: [
        'Study decision trees — splitting criteria, depth, pruning',
        'Understand random forests and why ensembles beat single models',
        'Learn gradient boosting (XGBoost/LightGBM) at a conceptual level',
        'Run a feature importance analysis on a tabular dataset',
      ],
    },
    {
      week: 5,
      title: 'Neural networks basics',
      goals: [
        'Understand perceptrons, activation functions, and forward pass',
        'Learn backpropagation intuitively — gradients and weight updates',
        'Build a simple feedforward network with Keras',
        'Train a digit classifier on MNIST and hit >95% accuracy',
      ],
    },
    {
      week: 6,
      title: 'Deep learning and CNNs',
      goals: [
        'Understand convolutional layers, pooling, and feature maps',
        'Fine-tune a pretrained CNN (ResNet/MobileNet) with transfer learning',
        'Learn dropout, batch normalisation, and regularisation techniques',
        'Complete an image classification project on a dataset of your choice',
      ],
    },
    {
      week: 7,
      title: 'NLP and transformers',
      goals: [
        'Learn tokenisation, word embeddings, and attention mechanisms',
        'Understand the transformer architecture at an intuitive level',
        'Use HuggingFace to run sentiment analysis and text classification',
        'Fine-tune a small language model on a custom text dataset',
      ],
    },
    {
      week: 8,
      title: 'Capstone project and MLOps basics',
      goals: [
        'Define and scope an end-to-end ML project (problem → deployment)',
        'Package your model as a REST API using FastAPI',
        'Learn experiment tracking with MLflow or Weights & Biases',
        'Deploy your model to a cloud endpoint and share the demo link',
      ],
    },
  ],
};

// ── Journey 2: AWS Solutions Architect ───────────────────────────────────────

const aws: Journey = {
  id: 'aws-saa',
  name: 'AWS Solutions Architect',
  category: 'Cloud',
  icon: 'Cloud',
  weeksMin: 10,
  weeksMax: 14,
  available: true,
  tileColor: 'bg-surface-container-lowest',
  weeks: [
    {
      week: 1,
      title: 'AWS core concepts and IAM',
      goals: [
        'Set up AWS free-tier account and explore the console',
        'Understand global infrastructure — regions, AZs, edge locations',
        'Deep dive on IAM: users, groups, roles, and policy structure',
        'Practice the principle of least privilege with a hands-on IAM lab',
      ],
    },
    {
      week: 2,
      title: 'EC2 and compute',
      goals: [
        'Launch, connect to, and configure an EC2 instance',
        'Understand instance types, purchasing options (On-Demand, Reserved, Spot)',
        'Configure Auto Scaling groups with launch templates',
        'Set up an Application Load Balancer and target groups',
      ],
    },
    {
      week: 3,
      title: 'Storage: S3, EBS, EFS',
      goals: [
        'Create S3 buckets with versioning, encryption, and lifecycle rules',
        'Understand S3 storage classes and when to use each',
        'Attach and manage EBS volumes — types, snapshots, encryption',
        'Set up EFS for shared file storage across multiple EC2 instances',
      ],
    },
    {
      week: 4,
      title: 'Networking: VPC and security',
      goals: [
        'Build a custom VPC with public and private subnets across two AZs',
        'Configure security groups vs NACLs — understand the difference',
        'Set up NAT gateways, internet gateways, and VPC peering',
        'Understand Route 53 routing policies — simple, weighted, failover, latency',
      ],
    },
    {
      week: 5,
      title: 'Databases: RDS, DynamoDB, ElastiCache',
      goals: [
        'Launch an RDS Multi-AZ instance and configure automated backups',
        'Understand read replicas and when to use them for scaling',
        'Design DynamoDB tables — partition keys, sort keys, GSIs',
        'Configure ElastiCache (Redis) for session management and caching',
      ],
    },
    {
      week: 6,
      title: 'Serverless and containers',
      goals: [
        'Build a Lambda function triggered by API Gateway and S3 events',
        'Understand Lambda concurrency, cold starts, and provisioned concurrency',
        'Run a containerised app with ECS Fargate — task definitions, services',
        'Explore Step Functions for serverless orchestration workflows',
      ],
    },
    {
      week: 7,
      title: 'Security, identity, and compliance',
      goals: [
        'Study IAM permission boundaries and cross-account access patterns',
        'Enable CloudTrail, AWS Config, and GuardDuty — understand each role',
        'Understand KMS key types, rotation, and envelope encryption',
        'Review the AWS Shared Responsibility Model for SAA-C03 exam questions',
      ],
    },
    {
      week: 8,
      title: 'High availability and disaster recovery',
      goals: [
        'Design multi-region active-active and active-passive architectures',
        'Understand RPO and RTO — and how they drive architecture choices',
        'Configure CloudFront with S3 and custom origins for global delivery',
        'Study HA patterns: pilot light, warm standby, multi-site active-active',
      ],
    },
    {
      week: 9,
      title: 'Monitoring, cost optimisation, and well-architected',
      goals: [
        'Set up CloudWatch dashboards, metrics, alarms, and log groups',
        'Configure AWS Cost Explorer, budgets, and cost allocation tags',
        'Review Trusted Advisor recommendations in a real account',
        'Study all 6 pillars of the AWS Well-Architected Framework',
      ],
    },
    {
      week: 10,
      title: 'Practice exams and weak-area review',
      goals: [
        'Complete 2 full-length practice exams (65 questions each) under timed conditions',
        'Identify your 3 weakest domains and do targeted topic review',
        'Re-read the AWS Well-Architected Framework whitepaper key sections',
        'Schedule and confirm your exam date — register if not already done',
      ],
    },
  ],
};

// ── Journey 3: Product Management Transition ──────────────────────────────────

const pm: Journey = {
  id: 'pm-transition',
  name: 'Product Management Transition',
  category: 'Product',
  icon: 'LayoutDashboard',
  weeksMin: 8,
  weeksMax: 12,
  available: true,
  tileColor: 'bg-[#f3e5f5]',
  weeks: [
    {
      week: 1,
      title: 'What PMs actually do',
      goals: [
        'Read "Inspired" by Marty Cagan — chapters 1–6',
        'Shadow or interview one PM in your network (even a 20-min call)',
        'Map out the PM role at 3 companies you want to work at',
        'Write a 1-page answer to: "Why do you want to be a PM?"',
      ],
    },
    {
      week: 2,
      title: 'User research and discovery',
      goals: [
        'Learn the Jobs-to-be-Done framework — watch Christensen\'s original talk',
        'Read "The Mom Test" by Rob Fitzpatrick (it\'s short — read all of it)',
        'Conduct 3 user interviews using the Mom Test method',
        'Write a clear problem statement based on your interview findings',
      ],
    },
    {
      week: 3,
      title: 'Prioritisation frameworks',
      goals: [
        'Study RICE, ICE, MoSCoW, and Kano model — understand when to use each',
        'Build a prioritisation matrix for 10 hypothetical features',
        'Learn opportunity scoring from Ulwick\'s Outcome-Driven Innovation',
        'Practice the "say no with data" skill — write 3 rejection rationales',
      ],
    },
    {
      week: 4,
      title: 'Product strategy and roadmaps',
      goals: [
        'Write a product vision statement for a product you use daily',
        'Build a now/next/later roadmap — outcomes, not output',
        'Study OKR writing: understand the difference between outputs and outcomes',
        'Present your roadmap to someone and get structured feedback',
      ],
    },
    {
      week: 5,
      title: 'Metrics and analytics',
      goals: [
        'Learn the AARRR funnel — map each stage to a real product',
        'Identify the North Star Metric for 3 products you use',
        'Write 5 SQL queries on a public dataset (Mode Analytics is free)',
        'Build a simple cohort retention table in a spreadsheet',
      ],
    },
    {
      week: 6,
      title: 'Technical fluency for PMs',
      goals: [
        'Understand REST APIs — read a public API doc (Stripe or GitHub)',
        'Learn system design basics: load balancers, databases, caching',
        'Write a 1-page technical spec for a simple feature you\'d build',
        'Attend or watch a sprint planning or sprint retro session',
      ],
    },
    {
      week: 7,
      title: 'Stakeholder management and communication',
      goals: [
        'Write a PRFAQ (Press Release + FAQ) for a product idea you have',
        'Practice a 5-minute product demo — record yourself',
        'Write a PM weekly update template you\'d actually send to stakeholders',
        'Map your current (or imagined) stakeholder landscape and influence matrix',
      ],
    },
    {
      week: 8,
      title: 'Case studies and interview prep',
      goals: [
        'Complete one full PM case study end-to-end (discovery → metrics)',
        'Practice 5 product design questions using the CIRCLES method',
        'Record yourself answering: "Design a product for X" — watch it back',
        'Prepare your "Why PM, why now, why this company" story',
      ],
    },
  ],
};

// ── Journey 4: Data Analytics ─────────────────────────────────────────────────

const dataAnalytics: Journey = {
  id: 'data-analytics',
  name: 'Data Analytics',
  category: 'Data',
  icon: 'BarChart2',
  weeksMin: 10,
  weeksMax: 16,
  available: true,
  tileColor: 'bg-[#e3f2fd]',
  weeks: [
    {
      week: 1,
      title: 'Data foundations and spreadsheet mastery',
      goals: [
        'Understand data types, data structures, and the analytics workflow',
        'Master VLOOKUP, INDEX/MATCH, pivot tables in Excel or Google Sheets',
        'Clean a messy dataset: handle nulls, duplicates, and formatting issues',
        'Build your first dashboard summarising a dataset of your choice',
      ],
    },
    {
      week: 2,
      title: 'SQL fundamentals',
      goals: [
        'Write SELECT, WHERE, GROUP BY, ORDER BY, and HAVING queries',
        'Understand INNER, LEFT, RIGHT, and FULL JOINs with real examples',
        'Use aggregate functions: COUNT, SUM, AVG, MIN, MAX',
        'Complete 10 SQL challenges on Mode Analytics or LeetCode',
      ],
    },
    {
      week: 3,
      title: 'Intermediate SQL and database thinking',
      goals: [
        'Write subqueries and CTEs (Common Table Expressions)',
        'Understand window functions: ROW_NUMBER, RANK, LAG, LEAD',
        'Study database normalisation and when denormalisation makes sense',
        'Complete a multi-table analysis challenge from a real business scenario',
      ],
    },
    {
      week: 4,
      title: 'Python for data analysis',
      goals: [
        'Set up Python with Pandas, NumPy, and Matplotlib',
        'Load, inspect, and clean a dataset with Pandas',
        'Group, filter, and aggregate data with Pandas operations',
        'Reproduce your spreadsheet dashboard in Python',
      ],
    },
    {
      week: 5,
      title: 'Data visualisation principles',
      goals: [
        'Study data visualisation principles: choosing the right chart type',
        'Build visualisations with Matplotlib and Seaborn',
        'Learn Tableau or Looker Studio basics — connect to a data source',
        'Build a shareable dashboard with 4+ charts telling a data story',
      ],
    },
    {
      week: 6,
      title: 'Statistics for analysts',
      goals: [
        'Understand descriptive statistics: mean, median, mode, standard deviation',
        'Learn probability basics and normal distribution',
        'Study hypothesis testing: p-values, confidence intervals, t-tests',
        'Run an A/B test analysis on a sample dataset',
      ],
    },
    {
      week: 7,
      title: 'Business analytics and metrics',
      goals: [
        'Learn key business metrics: CAC, LTV, churn, NPS, retention',
        'Study funnel analysis and cohort analysis in practice',
        'Build a cohort retention chart from raw event-level data',
        'Write an analytics brief: here\'s what the data says, here\'s what we should do',
      ],
    },
    {
      week: 8,
      title: 'Intro to machine learning for analysts',
      goals: [
        'Understand when ML is useful vs when SQL + stats is enough',
        'Build a simple linear regression model to predict a business outcome',
        'Learn decision trees for classification at a conceptual level',
        'Use scikit-learn to build and evaluate a model on real data',
      ],
    },
    {
      week: 9,
      title: 'Capstone project — part 1',
      goals: [
        'Choose a public dataset on a topic you care about',
        'Define the business question you\'re trying to answer',
        'Complete EDA (exploratory data analysis) and document findings',
        'Build an analysis plan: what queries or models will you run?',
      ],
    },
    {
      week: 10,
      title: 'Capstone project — part 2 and portfolio',
      goals: [
        'Complete your analysis and build the final dashboard or report',
        'Write a clear executive summary: insights and recommendations',
        'Publish your project to GitHub with a README',
        'Add the project to your portfolio and LinkedIn profile',
      ],
    },
  ],
};

// ── Journey 5: PMP Certification ──────────────────────────────────────────────

const pmp: Journey = {
  id: 'pmp',
  name: 'PMP Certification',
  category: 'Project Management',
  icon: 'ClipboardList',
  weeksMin: 12,
  weeksMax: 20,
  available: true,
  tileColor: 'bg-surface-container-low',
  weeks: [
    {
      week: 1,
      title: 'PMP foundations and exam structure',
      goals: [
        'Understand the PMP exam format: 180 questions, predictive + agile + hybrid',
        'Review the ECO (Exam Content Outline) — three domains and task breakdowns',
        'Complete PMI\'s required 35 contact hours (enrol in a course if needed)',
        'Set up your study schedule and register for the exam',
      ],
    },
    {
      week: 2,
      title: 'Project initiation and business case',
      goals: [
        'Understand the project charter and when/why it\'s created',
        'Study stakeholder identification and stakeholder register',
        'Learn benefits realisation management and business case structure',
        'Practice 20 initiation-domain exam questions',
      ],
    },
    {
      week: 3,
      title: 'Scope and requirements management',
      goals: [
        'Understand requirements gathering: interviews, workshops, prototypes',
        'Build a WBS (Work Breakdown Structure) for a sample project',
        'Study scope validation vs scope control — the difference matters in the exam',
        'Learn scope creep patterns and how experienced PMs handle them',
      ],
    },
    {
      week: 4,
      title: 'Schedule and critical path',
      goals: [
        'Study activity sequencing: PDM, dependencies, leads and lags',
        'Calculate the critical path and float on a network diagram',
        'Understand schedule compression: crashing vs fast tracking',
        'Practice 20 schedule domain questions with a focus on CPM calculations',
      ],
    },
    {
      week: 5,
      title: 'Cost management and EVM',
      goals: [
        'Understand cost estimation techniques: analogous, parametric, bottom-up',
        'Study Earned Value Management: PV, EV, AC, SPI, CPI, EAC, ETC, VAC',
        'Interpret EVM metrics in scenario-based questions',
        'Practice 20 cost and EVM exam questions',
      ],
    },
    {
      week: 6,
      title: 'Quality management',
      goals: [
        'Understand quality planning, quality assurance, and quality control',
        'Study key quality tools: cause-and-effect diagram, control charts, Pareto',
        'Learn the cost of quality: prevention, appraisal, internal/external failure',
        'Understand the difference between quality and grade in PMI\'s framing',
      ],
    },
    {
      week: 7,
      title: 'Resource and team management',
      goals: [
        'Study resource planning: RACI matrix, resource calendar, histogram',
        'Understand team development stages: Tuckman\'s model in PM context',
        'Learn conflict resolution techniques and when each is appropriate',
        'Study virtual team management and co-located team differences',
      ],
    },
    {
      week: 8,
      title: 'Risk management',
      goals: [
        'Understand the risk management process from planning to monitoring',
        'Build a risk register with probability/impact matrix',
        'Study risk response strategies: avoid, mitigate, transfer, accept (threats)',
        'Understand opportunity responses: exploit, enhance, share, accept',
      ],
    },
    {
      week: 9,
      title: 'Procurement and stakeholder engagement',
      goals: [
        'Study contract types: FFP, CPFF, CPIF, T&M — when to use each',
        'Understand procurement planning, source selection, and contract closure',
        'Learn stakeholder engagement levels: unaware → leading',
        'Study communication planning and information distribution methods',
      ],
    },
    {
      week: 10,
      title: 'Agile and hybrid approaches',
      goals: [
        'Understand Agile values and principles from the Agile Manifesto',
        'Study Scrum: roles, ceremonies, artefacts, and sprint structure',
        'Learn Kanban and when it\'s preferred over Scrum',
        'Understand hybrid project management and when PMI recommends it',
      ],
    },
    {
      week: 11,
      title: 'Integration and change management',
      goals: [
        'Understand the integrated change control process and CCB',
        'Study project closure: lessons learned, final report, contract closure',
        'Learn knowledge management and transfer across projects',
        'Practice 30 integration and change-related exam questions',
      ],
    },
    {
      week: 12,
      title: 'Full-length practice exams and final review',
      goals: [
        'Complete 2 full-length 180-question practice exams under timed conditions',
        'Identify your 3 weakest domains and do a targeted review session',
        'Re-read the ECO domains and tasks — align your mental model to PMI\'s language',
        'Confirm your exam appointment and review logistics (ID, break policy)',
      ],
    },
  ],
};

// ── Journey 6: UX / Product Design ────────────────────────────────────────────

const uxDesign: Journey = {
  id: 'ux-design',
  name: 'UX / Product Design',
  category: 'Design',
  icon: 'Figma',
  weeksMin: 10,
  weeksMax: 14,
  available: true,
  tileColor: 'bg-[#fce4ec]',
  weeks: [
    {
      week: 1,
      title: 'UX foundations and design thinking',
      goals: [
        'Understand the 5 stages of design thinking: empathise → test',
        'Learn the difference between UX design, UI design, and product design',
        'Study Jakob Nielsen\'s 10 usability heuristics with real examples',
        'Critique 3 apps you use daily using the heuristics',
      ],
    },
    {
      week: 2,
      title: 'User research methods',
      goals: [
        'Learn qualitative vs quantitative research and when to use each',
        'Conduct 3 user interviews focused on a problem space of your choice',
        'Build a user persona and empathy map from your research',
        'Write a research synthesis: key themes and design implications',
      ],
    },
    {
      week: 3,
      title: 'Figma fundamentals',
      goals: [
        'Set up Figma and learn frames, layers, components, and auto layout',
        'Understand the grid system and spacing scale (8pt grid)',
        'Build a simple UI screen from scratch: a login page or onboarding step',
        'Learn variants and component properties for reusable design systems',
      ],
    },
    {
      week: 4,
      title: 'Information architecture and wireframing',
      goals: [
        'Study information architecture: navigation patterns, mental models',
        'Build a site map or app flow for a product you\'re designing',
        'Create low-fidelity wireframes for your main user flows',
        'Get feedback on your wireframes from 2 people and iterate',
      ],
    },
    {
      week: 5,
      title: 'Visual design principles',
      goals: [
        'Study typography: type scales, hierarchy, pairing, and readability',
        'Understand colour theory: contrast, accessibility (WCAG AA), and emotion',
        'Learn layout principles: proximity, alignment, whitespace, visual weight',
        'Redesign one screen from your wireframes applying these principles',
      ],
    },
    {
      week: 6,
      title: 'Design systems and components',
      goals: [
        'Understand what a design system is and why product teams use them',
        'Study Material Design or Apple HIG — how they structure components',
        'Build a mini design system: colours, type, spacing, and 5 components',
        'Apply your design system consistently across your 3 main screens',
      ],
    },
    {
      week: 7,
      title: 'Prototyping and usability testing',
      goals: [
        'Build an interactive prototype in Figma connecting your key screens',
        'Write a usability test plan: tasks, goals, and success criteria',
        'Run usability tests with 3 participants — observe and take notes',
        'Identify the top 3 usability issues and propose design fixes',
      ],
    },
    {
      week: 8,
      title: 'Mobile design and accessibility',
      goals: [
        'Understand mobile-specific patterns: bottom nav, gestures, safe areas',
        'Study touch target sizes, thumb zones, and one-handed use',
        'Audit your designs for accessibility: contrast, labels, focus states',
        'Implement accessibility improvements across your main flows',
      ],
    },
    {
      week: 9,
      title: 'Design handoff and working with engineers',
      goals: [
        'Understand how design handoff works: specs, redlines, and assets',
        'Use Figma\'s Dev Mode to prepare files for engineering handoff',
        'Study common developer-designer communication patterns',
        'Write a design spec document for one of your features',
      ],
    },
    {
      week: 10,
      title: 'Portfolio case study and presentation',
      goals: [
        'Structure your case study: problem → process → solution → outcome',
        'Document your design decisions with rationale at each step',
        'Build a portfolio page showcasing your project (Notion, Behance, or personal site)',
        'Present your case study out loud — time yourself at 10 minutes',
      ],
    },
  ],
};

// ── Journey 7: Cybersecurity (CompTIA Security+ SY0-701) ──────────────────────

const cybersecurity: Journey = {
  id: 'cybersecurity',
  name: 'Cybersecurity (Security+)',
  category: 'Security',
  icon: 'ShieldCheck',
  weeksMin: 10,
  weeksMax: 16,
  available: true,
  tileColor: 'bg-[#e8f5e9]',
  weeks: [
    {
      week: 1,
      title: 'Security foundations and the CIA triad',
      goals: [
        'Understand Confidentiality, Integrity, Availability and non-repudiation',
        'Study security control categories: technical, managerial, operational, physical',
        'Learn the Zero Trust architecture model and why it replaced perimeter security',
        'Understand AAA framework: authentication, authorisation, accounting',
      ],
    },
    {
      week: 2,
      title: 'Cryptography essentials',
      goals: [
        'Understand symmetric vs asymmetric encryption with real examples',
        'Study hashing: SHA-256, MD5, salting, and why hashing ≠ encryption',
        'Learn PKI: certificates, CAs, certificate chains, and TLS handshake',
        'Understand digital signatures and how they verify integrity + authenticity',
      ],
    },
    {
      week: 3,
      title: 'Threats, threat actors, and attack vectors',
      goals: [
        'Study threat actor types: nation-state, hacktivist, insider, organised crime',
        'Learn attack vectors: phishing, spear phishing, vishing, smishing',
        'Understand supply chain attacks and why they\'re increasingly common',
        'Study social engineering techniques: pretexting, baiting, tailgating',
      ],
    },
    {
      week: 4,
      title: 'Malware and application attacks',
      goals: [
        'Classify malware types: ransomware, trojans, worms, rootkits, spyware',
        'Understand SQL injection, XSS, CSRF, and directory traversal attacks',
        'Study buffer overflow and race conditions at a conceptual level',
        'Learn password attacks: brute force, credential stuffing, rainbow tables',
      ],
    },
    {
      week: 5,
      title: 'Network security architecture',
      goals: [
        'Understand network segmentation, VLANs, and microsegmentation',
        'Study firewall types: packet filtering, stateful, NGFW, WAF',
        'Learn IDS vs IPS — detection vs prevention and placement in a network',
        'Understand VPN types: site-to-site, remote access, split tunnelling',
      ],
    },
    {
      week: 6,
      title: 'Cloud security and virtualisation',
      goals: [
        'Understand cloud service models (IaaS, PaaS, SaaS) and shared responsibility',
        'Study cloud security controls: CASB, CSPM, and cloud-native security tools',
        'Learn containerisation security: Docker, Kubernetes, and image hardening',
        'Understand serverless security considerations and function permissions',
      ],
    },
    {
      week: 7,
      title: 'Identity and access management',
      goals: [
        'Study authentication factors: something you know/have/are + location/behaviour',
        'Understand MFA types and when passwordless authentication is used',
        'Learn SSO, federation, and SAML vs OAuth 2.0 vs OpenID Connect',
        'Study PAM (privileged access management) and why it matters',
      ],
    },
    {
      week: 8,
      title: 'Security operations and monitoring',
      goals: [
        'Understand SIEM systems: log collection, correlation, and alerting',
        'Study SOAR and how automation reduces mean time to respond',
        'Learn vulnerability scanning vs penetration testing — scope and purpose',
        'Understand endpoint detection and response (EDR) tools',
      ],
    },
    {
      week: 9,
      title: 'Incident response and digital forensics',
      goals: [
        'Study the incident response lifecycle: prepare → identify → contain → eradicate → recover → lessons learned',
        'Understand chain of custody and evidence handling in digital forensics',
        'Learn log analysis basics: what to look for in Windows event logs and Linux syslogs',
        'Study threat hunting concepts: indicators of compromise (IOCs)',
      ],
    },
    {
      week: 10,
      title: 'Governance, risk, compliance, and practice exams',
      goals: [
        'Understand risk management: risk register, risk appetite, BIA',
        'Study compliance frameworks: GDPR, HIPAA, PCI-DSS, NIST CSF',
        'Learn data classification levels and handling requirements',
        'Complete 2 full 90-question practice exams and review every wrong answer',
      ],
    },
  ],
};

// ── Journey 8: Gen AI for Non-Engineers ───────────────────────────────────────

const genAI: Journey = {
  id: 'gen-ai-nontechnical',
  name: 'Gen AI for Non-Engineers',
  category: 'AI',
  icon: 'Sparkles',
  weeksMin: 4,
  weeksMax: 8,
  available: true,
  tileColor: 'bg-[#fff8e1]',
  weeks: [
    {
      week: 1,
      title: 'How LLMs actually work',
      goals: [
        'Understand what large language models are — tokens, training, and inference',
        'Learn the difference between GPT, Claude, Gemini, and Llama at a high level',
        'Understand hallucination, context windows, and temperature',
        'Watch Andrej Karpathy\'s "Intro to LLMs" (1 hour) — it\'s the best non-technical explanation',
      ],
    },
    {
      week: 2,
      title: 'Prompt engineering fundamentals',
      goals: [
        'Learn the anatomy of a good prompt: role, context, task, format, constraints',
        'Practice zero-shot, one-shot, and few-shot prompting with real examples',
        'Understand chain-of-thought prompting and when it improves output quality',
        'Build a personal prompt library for 5 tasks you do regularly at work',
      ],
    },
    {
      week: 3,
      title: 'AI tools for your workflow',
      goals: [
        'Master ChatGPT / Claude for writing, summarising, and editing',
        'Use Perplexity for research and source-grounded answers',
        'Explore image generation: Midjourney or DALL-E for presentations and mockups',
        'Set up a personal AI workflow replacing one manual task you do weekly',
      ],
    },
    {
      week: 4,
      title: 'AI for specific professions',
      goals: [
        'Explore AI tools relevant to your domain (marketing, finance, HR, legal)',
        'Study AI use cases in your industry — find 3 real company case studies',
        'Understand AI limitations: what it reliably does well vs where it fails',
        'Audit your current workflow: identify 3 tasks AI could accelerate',
      ],
    },
    {
      week: 5,
      title: 'Building with no-code AI tools',
      goals: [
        'Understand what an API is and how non-engineers can use AI APIs',
        'Set up a simple automation using Make (Integromat) or Zapier with an AI step',
        'Build a custom GPT or Claude project with specific instructions and context',
        'Create a simple AI-powered document or report generator for your use case',
      ],
    },
    {
      week: 6,
      title: 'AI strategy and responsible use',
      goals: [
        'Study AI ethics: bias, transparency, privacy, and accountability',
        'Understand GDPR implications of using AI tools with customer data',
        'Learn how to evaluate AI tools for enterprise adoption (security, data handling)',
        'Write a 1-page AI adoption brief for your team or use case',
      ],
    },
  ],
};

// ── Journey 9: CFA Level 1 ────────────────────────────────────────────────────

const cfa: Journey = {
  id: 'cfa-level1',
  name: 'CFA Level 1',
  category: 'Finance',
  icon: 'TrendingUp',
  weeksMin: 16,
  weeksMax: 24,
  available: true,
  tileColor: 'bg-[#f3e5f5]',
  weeks: [
    {
      week: 1,
      title: 'Quantitative methods — time value of money',
      goals: [
        'Master TVM calculations: PV, FV, NPV, IRR using BA II Plus calculator',
        'Understand annuities (ordinary and due), perpetuities, and uneven cash flows',
        'Study effective annual rate vs stated rate and compounding periods',
        'Complete 30 TVM practice questions — this topic appears across all asset classes',
      ],
    },
    {
      week: 2,
      title: 'Quantitative methods — statistics and probability',
      goals: [
        'Understand descriptive statistics: mean, median, variance, standard deviation, skewness',
        'Study probability: conditional probability, Bayes\' theorem, probability trees',
        'Learn normal distribution, z-scores, and the central limit theorem',
        'Understand hypothesis testing: Type I/II errors, p-values, t-tests',
      ],
    },
    {
      week: 3,
      title: 'Economics — microeconomics',
      goals: [
        'Study supply and demand, elasticity, and consumer/producer surplus',
        'Understand firm behaviour: perfect competition, monopoly, oligopoly',
        'Learn cost structures: fixed, variable, marginal, and average costs',
        'Study market structures and their implications for pricing power',
      ],
    },
    {
      week: 4,
      title: 'Economics — macroeconomics and international trade',
      goals: [
        'Understand GDP, inflation, unemployment, and business cycles',
        'Study monetary policy tools and central bank operations',
        'Learn fiscal policy and its impact on aggregate demand',
        'Understand currency exchange rates: spot, forward, and PPP',
      ],
    },
    {
      week: 5,
      title: 'Financial statement analysis — income statement and balance sheet',
      goals: [
        'Understand revenue recognition standards under IFRS and US GAAP',
        'Study the income statement: gross profit, EBIT, EBITDA, EPS calculations',
        'Learn balance sheet structure: current vs non-current assets and liabilities',
        'Understand inventory methods: FIFO, LIFO, weighted average and their effects',
      ],
    },
    {
      week: 6,
      title: 'Financial statement analysis — cash flow and ratios',
      goals: [
        'Understand the cash flow statement: operating, investing, financing sections',
        'Study the indirect method of cash flow from operations',
        'Master key financial ratios: liquidity, solvency, profitability, activity',
        'Practice DuPont decomposition of ROE across different company types',
      ],
    },
    {
      week: 7,
      title: 'Corporate issuers',
      goals: [
        'Understand capital structure decisions and the Modigliani-Miller framework',
        'Study leverage: operating leverage, financial leverage, and combined leverage',
        'Learn dividend policy theories and share buybacks vs dividends',
        'Understand working capital management: cash conversion cycle',
      ],
    },
    {
      week: 8,
      title: 'Equity investments',
      goals: [
        'Understand equity markets: primary, secondary, and market structure',
        'Study equity valuation approaches: DDM, FCFE, comparables',
        'Learn Gordon Growth Model and multi-stage dividend discount models',
        'Understand price multiples: P/E, P/B, P/S, EV/EBITDA and their limitations',
      ],
    },
    {
      week: 9,
      title: 'Fixed income — bond basics and valuation',
      goals: [
        'Understand bond features: coupon, maturity, face value, embedded options',
        'Study bond valuation: price as PV of cash flows, YTM, current yield',
        'Learn the inverse relationship between bond prices and interest rates',
        'Understand spot rates, forward rates, and bootstrapping yield curves',
      ],
    },
    {
      week: 10,
      title: 'Fixed income — risk and credit',
      goals: [
        'Study duration: Macaulay, modified, and effective duration',
        'Understand convexity and why it matters for large rate changes',
        'Learn credit risk: default probability, loss given default, credit spreads',
        'Study credit rating agencies and the investment grade vs high yield distinction',
      ],
    },
    {
      week: 11,
      title: 'Derivatives and alternative investments',
      goals: [
        'Understand forward and futures contracts: pricing, settlement, and hedging',
        'Study options: calls, puts, payoff diagrams, and basic strategies',
        'Learn swap contracts: interest rate swaps at a conceptual level',
        'Study alternative investments: hedge funds, PE, real estate, and commodities',
      ],
    },
    {
      week: 12,
      title: 'Portfolio management',
      goals: [
        'Understand Markowitz portfolio theory: risk, return, and diversification',
        'Study the efficient frontier and the capital market line',
        'Learn CAPM: beta, expected return, and the security market line',
        'Understand the investment policy statement (IPS) and its components',
      ],
    },
    {
      week: 13,
      title: 'Ethics and professional standards — part 1',
      goals: [
        'Study the CFA Institute Code of Ethics — memorise all 6 components',
        'Learn Standards I–IV: professionalism, integrity, duties to clients, employer',
        'Practice applying standards to scenario-based questions',
        'Understand the "knowledge of the law" standard and what it requires',
      ],
    },
    {
      week: 14,
      title: 'Ethics and professional standards — part 2',
      goals: [
        'Study Standards V–VII: investment analysis, conflicts of interest, responsibilities',
        'Learn GIPS (Global Investment Performance Standards) key concepts',
        'Complete 50 ethics questions — this is the highest-weighted topic',
        'Review the CFA Institute\'s ethics cases and their resolutions',
      ],
    },
    {
      week: 15,
      title: 'Weak area review and first mock exam',
      goals: [
        'Take your first full 180-question mock exam under timed conditions',
        'Score your results by topic and identify bottom 3 areas',
        'Do a focused 3-day review of your weakest topic area',
        'Review every wrong answer — understand why the correct answer is correct',
      ],
    },
    {
      week: 16,
      title: 'Final mock exams and exam-day preparation',
      goals: [
        'Complete 2 more full mock exams — aim to improve score by 5%+ each time',
        'Re-read Ethics once more — it\'s worth spending 15–20% of your final prep here',
        'Drill your BA II Plus calculator: TVM, IRR, NPV, stat functions at speed',
        'Confirm exam logistics: test centre, valid ID, permitted items, break policy',
      ],
    },
  ],
};

// ── Journey 10: DSA + System Design ──────────────────────────────────────────

const dsa: Journey = {
  id: 'dsa-system-design',
  name: 'DSA + System Design',
  category: 'Engineering',
  icon: 'Code2',
  weeksMin: 8,
  weeksMax: 16,
  available: true,
  tileColor: 'bg-[#e8eaf6]',
  weeks: [
    {
      week: 1,
      title: 'Arrays, strings, and complexity',
      goals: [
        'Understand Big-O notation: time and space complexity analysis',
        'Solve 10 array problems: two pointers, sliding window, prefix sums',
        'Study string manipulation patterns: reversal, anagrams, palindromes',
        'Complete the "Two Sum" and 4 related hash map problems on LeetCode',
      ],
    },
    {
      week: 2,
      title: 'Linked lists and stacks and queues',
      goals: [
        'Implement singly and doubly linked lists from scratch',
        'Solve linked list problems: reversal, cycle detection, merge two lists',
        'Study stack and queue implementations and when to use each',
        'Solve 8 stack/queue problems: valid parentheses, min stack, sliding window maximum',
      ],
    },
    {
      week: 3,
      title: 'Binary search and sorting',
      goals: [
        'Master binary search and its variants: rotated arrays, first/last occurrence',
        'Understand merge sort and quicksort — implement both from scratch',
        'Study sorting complexity and when built-in sort is vs isn\'t enough',
        'Solve 8 binary search problems — most interviews expect this in O(log n)',
      ],
    },
    {
      week: 4,
      title: 'Trees and binary search trees',
      goals: [
        'Implement BST insert, delete, and search',
        'Master tree traversals: inorder, preorder, postorder, level-order (BFS)',
        'Solve tree problems: max depth, lowest common ancestor, path sum',
        'Understand balanced trees and AVL trees at a conceptual level',
      ],
    },
    {
      week: 5,
      title: 'Graphs and BFS/DFS',
      goals: [
        'Understand graph representations: adjacency list vs adjacency matrix',
        'Implement BFS and DFS from scratch — both iterative and recursive',
        'Solve graph problems: number of islands, course schedule (topological sort)',
        'Study Dijkstra\'s shortest path algorithm with a hands-on implementation',
      ],
    },
    {
      week: 6,
      title: 'Dynamic programming',
      goals: [
        'Understand memoisation vs tabulation and when to use each',
        'Solve 1D DP problems: climbing stairs, house robber, coin change',
        'Study 2D DP: unique paths, longest common subsequence',
        'Recognise the DP pattern: "optimal substructure + overlapping subproblems"',
      ],
    },
    {
      week: 7,
      title: 'Heaps, tries, and advanced data structures',
      goals: [
        'Understand min-heap and max-heap and implement with heapify',
        'Solve heap problems: k largest elements, merge k sorted lists, median finder',
        'Study the trie data structure for prefix/autocomplete problems',
        'Understand union-find (disjoint set) for connected components problems',
      ],
    },
    {
      week: 8,
      title: 'System design fundamentals',
      goals: [
        'Understand the system design interview format and what interviewers look for',
        'Study scalability basics: vertical vs horizontal scaling, load balancers',
        'Learn database fundamentals: SQL vs NoSQL, sharding, replication',
        'Study caching: where to cache, cache invalidation, Redis use cases',
      ],
    },
    {
      week: 9,
      title: 'System design — distributed systems',
      goals: [
        'Understand CAP theorem and consistency vs availability tradeoffs',
        'Study message queues: Kafka, RabbitMQ — when and why to use them',
        'Learn CDNs, DNS, and how requests travel from browser to server',
        'Understand rate limiting strategies and API gateway patterns',
      ],
    },
    {
      week: 10,
      title: 'System design — design exercises',
      goals: [
        'Design URL shortener (TinyURL) end-to-end with capacity estimation',
        'Design a Twitter-style news feed with fanout strategies',
        'Design a distributed key-value store like Redis or DynamoDB',
        'Practice explaining designs out loud — record yourself for 15 minutes',
      ],
    },
    {
      week: 11,
      title: 'Mock interviews and pattern recognition',
      goals: [
        'Complete 3 timed mock LeetCode sessions (45 min each, medium difficulty)',
        'Study the 14 coding patterns: sliding window, two pointers, fast/slow, etc.',
        'Do 2 mock system design interviews with a friend or on Pramp/interviewing.io',
        'Review and categorise every problem you\'ve solved by pattern',
      ],
    },
    {
      week: 12,
      title: 'Behavioural prep and final review',
      goals: [
        'Prepare your STAR stories: 5 situations covering leadership, failure, conflict',
        'Study company-specific coding style (e.g. Google prefers clean code + edge cases)',
        'Revise your weakest topic area with 20 targeted problems',
        'Complete a full interview simulation: 45 min coding + 30 min system design',
      ],
    },
  ],
};

// ── Export ────────────────────────────────────────────────────────────────────

export const journeys: Journey[] = [
  aiml,
  aws,
  pm,
  dataAnalytics,
  pmp,
  uxDesign,
  cybersecurity,
  genAI,
  cfa,
  dsa,
];

export function getJourney(id: string): Journey | undefined {
  return journeys.find(j => j.id === id);
}

export function getAvailableJourneys(): Journey[] {
  return journeys.filter(j => j.available);
}

export function getComingSoonJourneys(): Journey[] {
  return journeys.filter(j => !j.available);
}