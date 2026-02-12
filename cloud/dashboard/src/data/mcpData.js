export const CATEGORIES = [
    { id: "popular", label: "Popular", description: "Most used tools and integrations", icon: "Star" },
    { id: "dev-tools", label: "Developer tools & devops", description: "developer tools & devops tools and integrations", icon: "Terminal" },
    { id: "collaboration", label: "Collaboration & communication", description: "collaboration & communication tools and integrations", icon: "MessageSquare" },
    { id: "ai-ml", label: "Ai & machine learning", description: "ai & machine learning tools and integrations", icon: "Cpu" },
    { id: "file-mgmt", label: "Document & file management", description: "document & file management tools and integrations", icon: "Files" },
    { id: "productivity-mgmt", label: "Productivity & project management", description: "productivity & project management tools and integrations", icon: "CheckSquare" },
    { id: "crm", label: "CRM", description: "crm tools and integrations", icon: "Users" },
    { id: "analytics", label: "Analytics & data", description: "analytics & data tools and integrations", icon: "BarChart3" },
    { id: "productivity", label: "Productivity", description: "productivity tools and integrations", icon: "Zap" },
    { id: "entertainment", label: "Entertainment & media", description: "entertainment & media tools and integrations", icon: "Play" },
    { id: "education", label: "Education & lms", description: "education & lms tools and integrations", icon: "GraduationCap" },
    { id: "design", label: "Design & creative tools", description: "design & creative tools tools and integrations", icon: "Palette" },
    { id: "marketing", label: "Marketing & social media", description: "marketing & social media tools and integrations", icon: "Share2" },
    { id: "scheduling", label: "Scheduling & booking", description: "scheduling & booking tools and integrations", icon: "Calendar" },
    { id: "ecommerce", label: "E-commerce", description: "e-commerce tools and integrations", icon: "ShoppingBag" },
    { id: "other", label: "Other / miscellaneous", description: "other / miscellaneous tools and integrations", icon: "Box" },
    { id: "finance", label: "Finance & accounting", description: "finance & accounting tools and integrations", icon: "CreditCard" },
    { id: "security", label: "Security & compliance", description: "security & compliance tools and integrations", icon: "ShieldCheck" },
    { id: "ai-video", label: "Ai-video", description: "ai-video tools and integrations", icon: "Video" },
    { id: "crypto", label: "Cryptocurrency", description: "cryptocurrency tools and integrations", icon: "Coins" },
    { id: "workflow", label: "Workflow automation", description: "workflow automation tools and integrations", icon: "Repeat" },
    { id: "hr", label: "Hr & recruiting", description: "hr & recruiting tools and integrations", icon: "UserPlus" }
];

export const MCP_DATA = [
    // Popular
    { name: "Gmail", description: "Gmail is Google’s email service, featuring spam protection, search functions, and seamless integration with other G Suite apps for productivity.", vendor: "google", category: "popular", icon: "✉️" },
    { name: "GitHub", description: "GitHub is a code hosting platform for version control and collaboration, offering Git-based repository management, issue tracking, and continuous integration features.", vendor: "github", category: "popular", icon: "🐙", managed: true, installCommand: "npx -y @modelcontextprotocol/server-github" },
    { name: "Google Calendar", description: "Google Calendar is a time management tool providing scheduling features, event reminders, and integration with email and other apps for streamlined organization.", vendor: "google", category: "popular", icon: "📅" },
    { name: "Notion", description: "Notion centralizes notes, docs, wikis, and tasks in a unified workspace, letting teams build custom workflows for collaboration and knowledge management.", vendor: "notion", category: "popular", icon: "📝", managed: true, installCommand: "npx -y @modelcontextprotocol/server-notion" },
    { name: "Google Sheets", description: "Google Sheets is a cloud-based spreadsheet tool enabling real-time collaboration, data analysis, and integration with other Google Workspace apps.", vendor: "google", category: "popular", icon: "📊" },
    { name: "Slack", description: "Slack is a channel-based messaging platform. With Slack, people can work together more effectively, connect all their software tools and services, and find the information they need to do their best work.", vendor: "slack", category: "popular", icon: "💬" },
    { name: "Linear", description: "Linear is a streamlined issue tracking and project planning tool for modern teams, featuring fast workflows, keyboard shortcuts, and GitHub integrations.", vendor: "linear", category: "popular", icon: "📈" },
    { name: "Trello", description: "A web-based, kanban-style, list-making application.", vendor: "atlassian", category: "popular", icon: "📋", managed: true, installCommand: "npx -y @modelcontextprotocol/server-trello" },

    // Developer tools & devops
    { name: "Supabase", description: "Supabase is an open-source backend-as-a-service providing a Postgres database, authentication, storage, and real-time subscription APIs for building modern applications.", vendor: "supabase", category: "dev-tools", icon: "⚡" },
    { name: "Bitbucket", description: "Bitbucket is a Git-based code hosting and collaboration platform supporting private and public repositories, enabling teams to manage and review code through pull requests and integrations.", vendor: "atlassian", category: "dev-tools", icon: "🔵" },
    { name: "Sentry", description: "Integrate Sentry to manage your error tracking and monitoring.", vendor: "sentry", category: "dev-tools", icon: "🐞" },
    { name: "Neon", description: "Postgres, on a serverless platform designed to help you build reliable and scalable applications faster.", vendor: "neon", category: "dev-tools", icon: "✨" },
    { name: "Zenrows", description: "ZenRows is a web scraping API allowing developers to bypass CAPTCHAs and blocks, gather structured data from dynamic websites, and quickly integrate results into applications.", vendor: "zenrows", category: "dev-tools", icon: "🕸️" },
    { name: "Pagerduty", description: "Integrate PagerDuty to manage incidents, schedules, and alerts directly from your application.", vendor: "pagerduty", category: "dev-tools", icon: "📟" },
    { name: "Contentful", description: "Contentful is a headless CMS allowing developers to create, manage, and distribute content across multiple channels and devices with an API-first approach.", vendor: "contentful", category: "dev-tools", icon: "📦" },
    { name: "Ably", description: "Ably is a real-time messaging platform helping developers build live features, including chat and data synchronization, with global scalability and robust reliability for modern applications.", vendor: "ably", category: "dev-tools", icon: "🔄" },
    { name: "Ngrok", description: "Ngrok creates secure tunnels to locally hosted applications, enabling developers to share and test webhooks or services without configuring complex network settings.", vendor: "ngrok", category: "dev-tools", icon: "🕳️" },
    { name: "Baserow", description: "Baserow is an open-source database tool that lets teams build no-code data applications, collaborate on records, and integrate with other services for data management.", vendor: "baserow", category: "dev-tools", icon: "🗄️" },
    { name: "Datadog", description: "Datadog offers monitoring, observability, and security for cloud-scale applications, unifying metrics, logs, and traces to help teams detect issues and optimize performance.", vendor: "datadog", category: "dev-tools", icon: "🐕" },

    // Collaboration & communication
    { name: "Outlook", description: "Outlook is Microsoft's email and calendaring platform integrating contacts and scheduling, enabling users to manage communications and events in a unified workspace.", vendor: "microsoft", category: "collaboration", icon: "✉️" },
    { name: "Slackbot", description: "Slackbot automates responses and reminders within Slack, assisting with tasks like onboarding, FAQs, and notifications to streamline team productivity.", vendor: "slack", category: "collaboration", icon: "🤖" },
    { name: "Microsoft teams", description: "Microsoft Teams integrates chat, video meetings, and file storage within Microsoft 365, providing virtual collaboration and communication for distributed teams.", vendor: "microsoft", category: "collaboration", icon: "👥" },
    { name: "Discordbot", description: "Discordbot refers to automated programs on Discord servers, performing tasks like moderation, music playback, and user engagement to enhance community interactions.", vendor: "discord", category: "collaboration", icon: "👾" },
    { name: "Google Meet", description: "Google Meet is a secure video conferencing platform that integrates with Google Workspace, facilitating remote meetings, screen sharing, and chat.", vendor: "google", category: "collaboration", icon: "📹" },
    { name: "Zoom", description: "Zoom is a video conferencing and online meeting platform featuring breakout rooms, screen sharing, and integrations with various enterprise tools.", vendor: "zoom", category: "collaboration", icon: "🎥" },
    { name: "Retellai", description: "RetellAI captures calls and transcripts, enabling businesses to analyze conversations, extract insights, and enhance customer interactions in one centralized platform.", vendor: "retellai", category: "collaboration", icon: "📞" },
    { name: "Share point", description: "SharePoint is a Microsoft platform for document management and intranets, enabling teams to collaborate, store, and organize content securely and effectively.", vendor: "microsoft", category: "collaboration", icon: "📂" },
    { name: "Webex", description: "Webex is a Cisco-powered video conferencing and collaboration platform offering online meetings, webinars, screen sharing, and team messaging.", vendor: "cisco", category: "collaboration", icon: "🌐" },
    { name: "Dailybot", description: "DailyBot simplifies team collaboration and tasks with chat-based standups, reminders, polls, and integrations, streamlining workflow automation in popular messaging platforms.", vendor: "dailybot", category: "collaboration", icon: "🤖" },
    { name: "Chatwork", description: "Chatwork is a team communication platform featuring group chats, file sharing, and task management, aiming to enhance collaboration and productivity for businesses.", vendor: "chatwork", category: "collaboration", icon: "💬" },
    { name: "Dialpad", description: "Dialpad is a cloud-based business phone system and contact center platform that enables voice, video, messages and meetings across your existing devices.", vendor: "dialpad", category: "collaboration", icon: "☎️" },
    { name: "Stack exchange", description: "Stack Exchange is a network of Q&A communities where users ask questions, share knowledge, and collaborate on topics like coding, math, and more.", vendor: "stackexchange", category: "collaboration", icon: "📊" },
    { name: "Echtpost", description: "EchtPost facilitates secure digital communication, encryption, and data privacy, providing a reliable channel for sending confidential documents and messages.", vendor: "echtpost", category: "collaboration", icon: "🔒" },
    { name: "Agent mail", description: "AgentMail provides AI agents with their own email inboxes, enabling them to send, receive, and act upon emails for communication with services, people, and other agents.", vendor: "agentmail", category: "collaboration", icon: "📩" },

    // Ai & machine learning
    { name: "Perplexityai", description: "Perplexity AI provides conversational AI models for generating human-like text responses.", vendor: "perplexity", category: "ai-ml", icon: "🧠" },
    { name: "Mem0", description: "Mem0 assists with AI-driven note-taking, knowledge recall, and productivity tools, allowing users to organize, search, and generate content from stored information.", vendor: "mem0", category: "ai-ml", icon: "🧠" },
    { name: "Semanticscholar", description: "Semantic Scholar is an AI-powered academic search engine that helps researchers discover and understand scientific literature.", vendor: "semanticscholar", category: "ai-ml", icon: "🎓" },
    { name: "Lmnt", description: "LMNT focuses on voice and audio manipulation, possibly leveraging AI to generate or transform sound for various creative and technical use cases.", vendor: "lmnt", category: "ai-ml", icon: "🔊" },
    { name: "Typefully", description: "Typefully is a platform for creating and managing AI-powered content.", vendor: "typefully", category: "ai-ml", icon: "✍️" },
    { name: "Humanloop", description: "Humanloop helps developers build and refine AI applications, offering user feedback loops, model training, and data annotation to iterate on language model performance.", vendor: "humanloop", category: "ai-ml", icon: "➰" },
    { name: "Textrazor", description: "TextRazor is a natural language processing API that extracts meaning, entities, and relationships from text, powering advanced content analysis and sentiment detection.", vendor: "textrazor", category: "ai-ml", icon: "✂️" },

    // Document & file management
    { name: "Google Drive", description: "Google Drive is a cloud storage solution for uploading, sharing, and collaborating on files across devices, with robust search and offline access.", vendor: "google", category: "file-mgmt", icon: "📁" },
    { name: "One drive", description: "OneDrive is Microsoft’s cloud storage solution enabling users to store, sync, and share files across devices, offering offline access, real-time collaboration, and enterprise-grade security.", vendor: "microsoft", category: "file-mgmt", icon: "☁️" },
    { name: "Docusign", description: "DocuSign provides eSignature and digital agreement solutions, enabling businesses to send, sign, track, and manage documents electronically.", vendor: "docusign", category: "file-mgmt", icon: "🖋️" },
    { name: "Dropbox", description: "Dropbox is a cloud storage service offering file syncing, sharing, and collaboration across devices with version control and robust integrations.", vendor: "dropbox", category: "file-mgmt", icon: "📦" },
    { name: "Googlephotos", description: "Google Photos is a cloud-based photo storage and organization service offering automatic backups, AI-assisted search, and shared albums for personal and collaborative media management.", vendor: "google", category: "file-mgmt", icon: "🖼️" },
    { name: "Google Super", description: "Google Super App combines all Google services including Drive, Calendar, Gmail, Sheets, Analytics, Ads, and more, providing a unified platform for seamless integration and management of your digital life.", vendor: "google", category: "file-mgmt", icon: "⭐" },
    { name: "Pandadoc", description: "PandaDoc offers document creation, e-signatures, and workflow automation, helping sales teams and businesses streamline proposals, contracts, and agreement processes.", vendor: "pandadoc", category: "file-mgmt", icon: "🐼" },

    // Productivity & project management
    { name: "Google Docs", description: "Google Docs is a cloud-based word processor with real-time collaboration, version history, and integration with other Google Workspace apps.", vendor: "google", category: "productivity-mgmt", icon: "📄" },
    { name: "Airtable", description: "Airtable merges spreadsheet functionality with database power, enabling teams to organize projects, track tasks, and collaborate through customizable views, automation, and integrations for data management.", vendor: "airtable", category: "productivity-mgmt", icon: "📅" },
    { name: "Google Tasks", description: "Google Tasks provides a simple to-do list and task management system integrated into Gmail and Google Calendar for quick and easy tracking.", vendor: "google", category: "productivity-mgmt", icon: "✅" },
    { name: "Wrike", description: "Wrike is a project management and collaboration tool offering customizable workflows, Gantt charts, reporting, and resource management to boost team productivity.", vendor: "wrike", category: "productivity-mgmt", icon: "📝" },
    { name: "Clickup", description: "ClickUp unifies tasks, docs, goals, and chat in a single platform, allowing teams to plan, organize, and collaborate across projects with customizable workflows.", vendor: "clickup", category: "productivity-mgmt", icon: "📈", managed: true, installCommand: "npx -y @modelcontextprotocol/server-clickup" },
    { name: "Shortcut", description: "Shortcut aligns product development work with company objectives so teams can execute with a shared purpose.", vendor: "shortcut", category: "productivity-mgmt", icon: "🔗" },
    { name: "Coda", description: "Collaborative workspace platform that transforms documents into powerful tools for team productivity and project management.", vendor: "coda", category: "productivity-mgmt", icon: "📄" },
    { name: "Monday", description: "monday.com is a customizable work management platform for project planning, collaboration, and automation, supporting agile, sales, marketing, and more.", vendor: "monday", category: "productivity-mgmt", icon: "📅" },
    { name: "Onepage", description: "API for enriching user and company data, providing endpoints for token validation and generic search.", vendor: "onepage", category: "productivity-mgmt", icon: "📄" },
    { name: "Linkhut", description: "LinkHut manages bookmarked links in a minimalistic, shareable interface, helping teams organize URLs and track references in one place.", vendor: "linkhut", category: "productivity-mgmt", icon: "🔗" },
    { name: "Timely", description: "Timely is an automatic time-tracking platform capturing activity across applications, calendars, and devices, creating detailed timesheets for billing or productivity insights.", vendor: "timely", category: "productivity-mgmt", icon: "⏰" },
    { name: "Todoist", description: "Todoist is a task management tool allowing users to create to-do lists, set deadlines, and collaborate on projects with reminders and cross-platform syncing.", vendor: "todoist", category: "productivity-mgmt", icon: "✅" },
    { name: "Harvest", description: "Harvest is a time-tracking and invoicing tool designed for teams and freelancers, helping them log billable hours, manage projects, and streamline payments.", vendor: "harvest", category: "productivity-mgmt", icon: "🌾" },
    { name: "Google Slides", description: "Google Slides is a cloud-based presentation editor with real-time collaboration, template gallery, and integration with other Google Workspace apps.", vendor: "google", category: "productivity-mgmt", icon: "📉" },

    // CRM
    { name: "Hubspot", description: "HubSpot is an inbound marketing, sales, and customer service platform integrating CRM, email automation, and analytics to facilitate lead nurturing and seamless customer experiences.", vendor: "hubspot", category: "crm", icon: "🧡" },
    { name: "Salesforce", description: "Salesforce is a leading CRM platform integrating sales, service, marketing, and analytics to build customer relationships and drive business growth.", vendor: "salesforce", category: "crm", icon: "☁️" },
    { name: "Apollo", description: "Apollo provides CRM and lead generation capabilities, helping businesses discover contacts, manage outreach, and track sales pipelines for consistent customer relationship development.", vendor: "apollo", category: "crm", icon: "🚀" },
    { name: "Attio", description: "Attio is a fully customizable workspace for your team's relationships and workflows.", vendor: "attio", category: "crm", icon: "🅰️" },
    { name: "Zoho", description: "Zoho is a suite of cloud applications including CRM, email marketing, and collaboration tools, enabling businesses to automate and scale operations.", vendor: "zoho", category: "crm", icon: "🏢" },
    { name: "Freshdesk", description: "Freshdesk provides customer support software with ticketing, knowledge base, and automation features for efficient helpdesk operations and better customer experiences.", vendor: "freshworks", category: "crm", icon: "🍋" },
    { name: "Acculynx", description: "Using the AccuLynx API, data can be seamlessly exchanged between AccuLynx and other applications for greater efficiency and productivity.", vendor: "acculynx", category: "crm", icon: "🔗" },
    { name: "Affinity", description: "Affinity helps private capital investors to find, manage, and close more deals.", vendor: "affinity", category: "crm", icon: "🤝" },
    { name: "Agencyzoom", description: "AgencyZoom is for the P&C insurance agent that's looking to increase sales, boost retention and analyze agency & producer performance.", vendor: "agencyzoom", category: "crm", icon: "📈" },
    { name: "Pipedrive", description: "Pipedrive is a sales management tool built around pipeline visualization, lead tracking, activity reminders, and automation to keep deals progressing.", vendor: "pipedrive", category: "crm", icon: "📋" },
    { name: "Dynamics365", description: "Dynamics 365 from Microsoft combines CRM, ERP, and productivity apps to streamline sales, marketing, customer service, and operations in one integrated platform.", vendor: "microsoft", category: "crm", icon: "🟦" },
    { name: "Zendesk", description: "Zendesk provides customer support software with ticketing, live chat, and knowledge base features, enabling efficient helpdesk operations and customer engagement.", vendor: "zendesk", category: "crm", icon: "🌿" },
    { name: "Close", description: "Close is a CRM platform designed to help businesses manage and streamline their sales processes, including calling, email automation, and predictive dialers.", vendor: "close", category: "crm", icon: "❌" },
    { name: "Simplesat", description: "Simplesat captures customer feedback and CSAT scores through surveys, integrating directly with helpdesk systems for real-time performance insights.", vendor: "simplesat", category: "crm", icon: "😊" },
    { name: "Zoho bigin", description: "Zoho Bigin is a simplified CRM solution from Zoho tailored for small businesses, focusing on pipeline tracking and relationship management.", vendor: "zoho", category: "crm", icon: "🏢" },
    { name: "Gorgias", description: "Gorgias is a helpdesk and live chat platform specializing in e-commerce, offering automated support, order management, and unified customer communication.", vendor: "gorgias", category: "crm", icon: "🗣️" },
    { name: "Kommo", description: "Kommo CRM (formerly amoCRM) integration tool for managing customer relationships, sales pipelines, and business processes.", vendor: "kommo", category: "crm", icon: "💬" },
    { name: "Zoominfo", description: "AgencyZoom is for the P&C insurance agent that's looking to increase sales, boost retention and analyze agency & producer performance.", vendor: "zoominfo", category: "crm", icon: "🔍" },
    { name: "Intercom", description: "Intercom provides live chat, messaging, and customer engagement tools, enabling businesses to drive conversions, handle support, and personalize communication at scale.", vendor: "intercom", category: "crm", icon: "💬" },
    { name: "Capsule crm", description: "Capsule CRM is a simple yet powerful CRM platform designed to help businesses manage customer relationships, sales pipelines, and tasks efficiently.", vendor: "capsule", category: "crm", icon: "💊" },
    { name: "Fireberry", description: "Fireberry is a CRM platform that offers integrations with various tools and applications to streamline business processes.", vendor: "fireberry", category: "crm", icon: "🍓" },
    { name: "Firmao", description: "Firmao is a business information platform offering data and insights on companies, industries, and markets, providing tools for company research, industry analysis, and market intelligence.", vendor: "firmao", category: "crm", icon: "🏬" },
    { name: "Folk", description: "folk is a next-generation CRM designed for teams to manage and nurture their relationships efficiently.", vendor: "folk", category: "crm", icon: "👥" },
    { name: "Forcemanager", description: "ForceManager is a mobile-first CRM designed to enhance sales team productivity by providing real-time insights and streamlined management of customer interactions.", vendor: "forcemanager", category: "crm", icon: "💼" },
    { name: "Godial", description: "GoDial is an automatic call app, mobile CRM, and outbound dialer software that transforms your phone into a call center, enabling efficient management of calls and contacts.", vendor: "godial", category: "crm", icon: "📞" },
    { name: "Jobnimbus", description: "JobNimbus is a CRM and project management software designed for contractors, helping streamline scheduling, estimates, invoicing, and job tracking.", vendor: "jobnimbus", category: "crm", icon: "☁️" },
    { name: "Nocrm io", description: "noCRM.io is a lead management software designed to help sales teams track and close deals efficiently.", vendor: "nocrm", category: "crm", icon: "❌" },
    { name: "Page x", description: "PAGE X is a CRM solution that enables businesses to drive sales, track leads, automate tasks, and enhance service efficiency.", vendor: "pagex", category: "crm", icon: "📄" },
    { name: "Salesmate", description: "Salesmate is an AI-powered CRM platform designed to help businesses engage leads, close deals faster, nurture relationships, and provide seamless support through a unified, intuitive interface.", vendor: "salesmate", category: "crm", icon: "🤝" },

    // Analytics & data
    { name: "Serpapi", description: "SerpApi provides a real-time API for structured search engine results, allowing developers to scrape, parse, and analyze SERP data for SEO and research.", vendor: "serpapi", category: "analytics", icon: "🔍" },
    { name: "Firecrawl", description: "Firecrawl automates web crawling and data extraction, enabling organizations to gather content, index sites, and gain insights from online sources at scale.", vendor: "firecrawl", category: "analytics", icon: "🕷️" },
    { name: "Tavily", description: "Tavily offers search and data retrieval solutions, helping teams quickly locate and filter relevant information from documents, databases, or web sources.", vendor: "tavily", category: "analytics", icon: "🔍" },
    { name: "Exa", description: "Exa focuses on data extraction and search, helping teams gather, analyze, and visualize information from websites, APIs, or internal databases.", vendor: "exa", category: "analytics", icon: "🔍" },
    { name: "Snowflake", description: "Snowflake is a cloud-based data warehouse offering elastic scaling, secure data sharing, and SQL analytics across multiple cloud environments.", vendor: "snowflake", category: "analytics", icon: "❄️" },
    { name: "Peopledatalabs", description: "PeopleDataLabs provides B2B data enrichment and identity resolution, empowering organizations to build enriched user profiles and validate customer information.", vendor: "peopledatalabs", category: "analytics", icon: "👥" },
    { name: "Posthog", description: "PostHog is an open-source product analytics platform tracking user interactions and behaviors to help teams refine features, improve funnels, and reduce churn.", vendor: "posthog", category: "analytics", icon: "🦔" },
    { name: "Fireflies", description: "Fireflies.ai helps your team transcribe, summarize, search, and analyze voice conversations.", vendor: "fireflies", category: "analytics", icon: "🪰" },
    { name: "Mixpanel", description: "Mixpanel is a product analytics platform tracking user interactions and engagement, providing cohort analysis, funnels, and A/B testing to improve user experiences.", vendor: "mixpanel", category: "analytics", icon: "📊" },
    { name: "Amplitude", description: "Amplitude Inc. is an American publicly trading company that develops digital analytics software.", vendor: "amplitude", category: "analytics", icon: "📈" },
    { name: "Google BigQuery", description: "Google BigQuery is a fully managed data warehouse for large-scale data analytics, offering fast SQL queries and machine learning capabilities on massive datasets.", vendor: "google", category: "analytics", icon: "📊" },
    { name: "Microsoft clarity", description: "Microsoft Clarity is a free user behavior analytics tool that captures heatmaps, session recordings, and engagement metrics to help improve website experiences.", vendor: "microsoft", category: "analytics", icon: "✨" },
    { name: "Servicenow", description: "Servicenow provides IT Service Management Transform service management to boost productivity and maximize ROI.", vendor: "servicenow", category: "analytics", icon: "🏠" },
    { name: "Google Analytics", description: "Google Analytics tracks and reports website traffic, user behavior, and conversion data, enabling marketers to optimize online performance and customer journeys.", vendor: "google", category: "analytics", icon: "📊" },
    { name: "Browseai", description: "Browse.ai allows you to turn any website into an API using its advanced web automation and data extraction tools, enabling easy monitoring and data retrieval from websites.", vendor: "browseai", category: "analytics", icon: "👁️" },
    { name: "Placekey", description: "Placekey standardizes location data by assigning unique IDs to physical addresses, simplifying address matching and enabling data sharing across platforms.", vendor: "placekey", category: "analytics", icon: "🗺️" },
    { name: "Clickhouse", description: "ClickHouse is a fast open-source column-oriented database management system for real-time analytics and big data processing with SQL support.", vendor: "clickhouse", category: "analytics", icon: "🏠" },
    { name: "Kibana", description: "Kibana is a visualization and analytics platform for Elasticsearch, offering dashboards, data exploration, and monitoring capabilities for gaining insights from data.", vendor: "elastic", category: "analytics", icon: "📊" },
    { name: "Snowflake basic", description: "Snowflake is a cloud-based data warehouse offering elastic scaling, secure data sharing, and SQL analytics across multiple cloud environments.", vendor: "snowflake", category: "analytics", icon: "❄️" },

    // Productivity
    { name: "Jira", description: "A tool for bug tracking, issue tracking, and agile project management.", vendor: "atlassian", category: "productivity", icon: "📋" },
    { name: "Asana", description: "Tool to help teams organize, track, and manage their work.", vendor: "asana", category: "productivity", icon: "🧘" },
    { name: "Bolna", description: "Create conversational voice agents using Bolna AI to enhance interactions, streamline operations and automate support.", vendor: "bolna", category: "productivity", icon: "🗣️" },
    { name: "Calendarhero", description: "CalendarHero is a versatile scheduling tool designed to streamline and simplify your calendar management. It integrates seamlessly with your existing calendars, allowing you to efficiently schedule, reschedule, and manage meetings with ease.", vendor: "calendarhero", category: "productivity", icon: "📅" },
    { name: "Google Admin", description: "Google Admin Console for managing Google Workspace users, groups, and organizational units.", vendor: "google", category: "productivity", icon: "⚙️" },
    { name: "Habitica", description: "Habitica is an open-source task management application that gamifies productivity by turning tasks into role-playing game elements.", vendor: "habitica", category: "productivity", icon: "🎮" },
    { name: "Mem", description: "Mem is a note-taking and knowledge management application that helps users capture, organize, and retrieve information efficiently.", vendor: "mem", category: "productivity", icon: "📝" },
    { name: "Pushbullet", description: "Pushbullet enables seamless sharing of notifications and files across devices.", vendor: "pushbullet", category: "productivity", icon: "🔫" },
    { name: "Ticktick", description: "TickTick is a cross-platform task management and to-do list application designed to help users organize their tasks and schedules efficiently.", vendor: "ticktick", category: "productivity", icon: "✅" },
    { name: "Y gy", description: "y.gy is a URL shortener and QR code generator that allows users to create short, memorable links from long URLs, customize them with unique endings, and integrate with an API for programmatic link creation.", vendor: "ygy", category: "productivity", icon: "🔗" },

    // Entertainment & media
    { name: "Youtube", description: "YouTube is a video-sharing platform with user-generated content, live streaming, and monetization opportunities, widely used for marketing, education, and entertainment.", vendor: "google", category: "entertainment", icon: "📺" },
    { name: "Spotify", description: "Spotify is a digital music and podcast streaming service with millions of tracks, personalized playlists, and social sharing features.", vendor: "spotify", category: "entertainment", icon: "🎵" },

    // Education & lms
    { name: "Canvas", description: "Canvas is a learning management system supporting online courses, assignments, grading, and collaboration, widely used by schools and universities for virtual classrooms.", vendor: "instructure", category: "education", icon: "🎨" },
    { name: "D2lbrightspace", description: "D2L Brightspace is a learning management system that provides a comprehensive suite of tools for educators to create, manage, and deliver online courses and learning experiences.", vendor: "d2l", category: "education", icon: "💡" },

    // Design & creative tools
    { name: "Figma", description: "A collaborative interface design tool.", vendor: "figma", category: "design", icon: "🎨" },
    { name: "Miro", description: "Miro is a collaborative online whiteboard enabling teams to brainstorm ideas, design wireframes, plan workflows, and manage projects visually.", vendor: "miro", category: "design", icon: "🖼️" },
    { name: "Canva", description: "Canva offers a drag-and-drop design suite for creating social media graphics, presentations, and marketing materials with prebuilt templates and a vast element library.", vendor: "canva", category: "design", icon: "🎨" },
    { name: "Webflow", description: "Webflow is a no-code website design and hosting platform, letting users build responsive sites, launch online stores, and maintain content without coding.", vendor: "webflow", category: "design", icon: "🌐" },
    { name: "Mural", description: "Mural is a digital whiteboard platform enabling distributed teams to visually brainstorm, map ideas, and collaborate in real time with sticky notes and diagrams.", vendor: "mural", category: "design", icon: "🖼️" },

    // Marketing & social media
    { name: "Reddit", description: "Reddit is a social news platform with user-driven communities (subreddits), offering content sharing, discussions, and viral marketing opportunities for brands.", vendor: "reddit", category: "marketing", icon: "🤖" },
    { name: "Linkedin", description: "LinkedIn is a professional networking platform enabling job seekers, companies, and thought leaders to connect, share content, and discover business opportunities.", vendor: "linkedin", category: "marketing", icon: "🔗" },
    { name: "Klaviyo", description: "Klaviyo is a data-driven email and SMS marketing platform that allows e-commerce brands to deliver targeted messages, track conversions, and scale customer relationships.", vendor: "klaviyo", category: "marketing", icon: "📧" },
    { name: "Mailchimp", description: "Mailchimp is an email marketing and automation platform providing campaign templates, audience segmentation, and performance analytics to drive engagement and conversions.", vendor: "mailchimp", category: "marketing", icon: "🐒" },
    { name: "Ahrefs", description: "Ahrefs is an SEO and marketing platform offering site audits, keyword research, content analysis, and competitive insights to improve search rankings and drive organic traffic.", vendor: "ahrefs", category: "marketing", icon: "📈" },
    { name: "Sendgrid", description: "SendGrid is a cloud-based email delivery platform providing transactional and marketing email services, with APIs for integration, analytics, and scalability.", vendor: "twilio", category: "marketing", icon: "📧" },
    { name: "Facebook", description: "Facebook is a social media and advertising platform used by individuals and businesses to connect, share content, and promote products or services. Only supports Facebook Pages, not Facebook Personal accounts.", vendor: "meta", category: "marketing", icon: "👥" },
    { name: "Crustdata", description: "CrustData is an AI-powered data intelligence platform that provides real-time company and people data via APIs and webhooks, empowering B2B sales teams, AI SDRs, and investors to act on live signals.", vendor: "crustdata", category: "marketing", icon: "🥧" },
    { name: "Brandfetch", description: "Brandfetch offers an API that retrieves company logos, brand colors, and other visual assets, helping marketers and developers maintain consistent branding across apps.", vendor: "brandfetch", category: "marketing", icon: "🏷️" },
    { name: "Amcards", description: "AMCards enables users to create personalized greeting cards, automate mailing campaigns, strengthen customer relationships using a convenient online platform for individualized connections.", vendor: "amcards", category: "marketing", icon: "💌" },
    { name: "Active campaign", description: "ActiveCampaign is a marketing automation and CRM platform enabling businesses to manage email campaigns, sales pipelines, and customer segmentation to boost engagement and drive growth.", vendor: "activecampaign", category: "marketing", icon: "📧" },
    { name: "Eventbrite", description: "Eventbrite enables organizers to plan, promote, and manage events, selling tickets and providing attendee tools for conferences, concerts, and gatherings.", vendor: "eventbrite", category: "marketing", icon: "🎫" },

    // Scheduling & booking
    { name: "Cal", description: "Cal simplifies meeting coordination by providing shareable booking pages, calendar syncing, and availability management to streamline the scheduling process.", vendor: "calcom", category: "scheduling", icon: "📅" },
    { name: "Calendly", description: "Calendly is an appointment scheduling tool that automates meeting invitations, availability checks, and reminders, helping individuals and teams avoid email back-and-forth.", vendor: "calendly", category: "scheduling", icon: "📅" },
    { name: "Apaleo", description: "Apaleo is a cloud-based property management platform handling reservations, billing, and daily operations for hospitality businesses.", vendor: "apaleo", category: "scheduling", icon: "🏨" },

    // E-commerce
    { name: "Shopify", description: "Shopify is an e-commerce platform enabling merchants to create online stores, manage products, and process payments with themes, apps, and integrated marketing tools.", vendor: "shopify", category: "ecommerce", icon: "🛍️" },
    { name: "Junglescout", description: "Jungle Scout assists Amazon sellers with product research, sales estimates, and competitive insights to optimize inventory, pricing, and listing strategies.", vendor: "junglescout", category: "ecommerce", icon: "🦁" },
    { name: "Gumroad", description: "Gumroad simplifies selling digital goods, physical products, and memberships by offering a streamlined checkout, marketing tools, and direct payout options.", vendor: "gumroad", category: "ecommerce", icon: "🛤️" },
    { name: "Asin data api", description: "ASIN Data API provides detailed product data from Amazon, including price, rank, reviews, and more, enabling real-time insights for e-commerce professionals, marketers, and data analysts.", vendor: "asindataapi", category: "ecommerce", icon: "📊" },
    { name: "Baselinker", description: "BaseLinker is a comprehensive e-commerce management platform that integrates with various marketplaces, online stores, carriers, and accounting systems to streamline order processing, inventory management, and sales automation.", vendor: "baselinker", category: "ecommerce", icon: "📊" },
    { name: "Cloudcart", description: "CloudCart is an e-commerce platform that enables businesses to create and manage online stores efficiently.", vendor: "cloudcart", category: "ecommerce", icon: "🛒" },
    { name: "Countdown api", description: "Countdown API provides real-time eBay product data, including product details, customer reviews, seller feedback, and search results, enabling businesses and developers to access comprehensive eBay marketplace information.", vendor: "countdownapi", category: "ecommerce", icon: "📊" },
    { name: "Gift up", description: "Gift Up! is a digital platform that allows businesses to sell, manage, and redeem gift cards online, integrating seamlessly with websites and apps to streamline gift card transactions and promotions.", vendor: "giftup", category: "ecommerce", icon: "🎁" },
    { name: "Lemon squeezy", description: "Lemon Squeezy is a platform designed to simplify payments, taxes, and subscriptions for software companies, offering a powerful API and webhooks for seamless integration.", vendor: "lemonsqueezy", category: "ecommerce", icon: "🍋" },
    { name: "Payhip", description: "Payhip is an e-commerce platform that enables individuals and businesses to sell digital products, memberships, and physical goods directly to their audience.", vendor: "payhip", category: "ecommerce", icon: "🛍️" },

    // Other / miscellaneous
    { name: "Google Maps", description: "Integrate Google Maps to access location data, geocoding, directions, and mapping services in your application.", vendor: "google", category: "other", icon: "🗺️" },
    { name: "Yousearch", description: "YouSearch is a search engine or search tool that enables users to find relevant information, possibly with enhanced filtering or privacy-focused features.", vendor: "yousearch", category: "other", icon: "🔍" },
    { name: "Linkup", description: "Search the Web for Relevant Results (RAG Use Case)", vendor: "linkup", category: "other", icon: "🔗" },
    { name: "More trees", description: "More Trees is a sustainability-focused platform planting trees on behalf of individuals or businesses aiming to offset carbon footprints and support reforestation.", vendor: "moretrees", category: "other", icon: "🌳" },
    { name: "Yandex", description: "Yandex is a Russian internet services provider offering search, email, navigation, and other web-based solutions, often referred to as “Russia’s Google”.", vendor: "yandex", category: "other", icon: "🔍" },
    { name: "Tinyurl", description: "TinyURL shortens lengthy URLs, generating concise links for easier sharing and managing, often used in social media and marketing campaigns.", vendor: "tinyurl", category: "other", icon: "🔗" },
    { name: "Foursquare", description: "Search for places and place recommendations from the Foursquare Places database", vendor: "foursquare", category: "other", icon: "📍" },

    // Finance & accounting
    { name: "Stripe", description: "Stripe offers online payment infrastructure, fraud prevention, and APIs enabling businesses to accept and manage payments globally.", vendor: "stripe", category: "finance", icon: "💳" },
    { name: "Recallai", description: "The universal API for meeting bots & conversation data.", vendor: "recallai", category: "finance", icon: "🤖" },
    { name: "Xero", description: "Xero is a cloud-based accounting software for small businesses, providing invoicing, bank reconciliation, bookkeeping, and financial reporting in real time.", vendor: "xero", category: "finance", icon: "📊" },
    { name: "Brex", description: "Brex provides corporate credit cards, spend management, and financial tools tailored for startups and tech businesses to optimize cash flow, accounting, and growth.", vendor: "brex", category: "finance", icon: "💳" },
    { name: "Zoho invoice", description: "Zoho Invoice simplifies billing, recurring payments, and expense management, helping freelancers and small businesses send professional invoices.", vendor: "zoho", category: "finance", icon: "🏢" },
    { name: "Quickbooks", description: "Quickbooks is a cloud-based accounting software that helps you manage your finances, track your income and expenses, and get insights into your business.", vendor: "intuit", category: "finance", icon: "📊" },
    { name: "Ramp", description: "Ramp is a platform that helps you manage your finances, track your income and expenses, and get insights into your business.", vendor: "ramp", category: "finance", icon: "📈" },

    // Security & compliance
    { name: "Borneo", description: "Borneo is a data security and privacy platform designed for sensitive data discovery and remediation.", vendor: "borneo", category: "security", icon: "🛡️" },

    // Ai-video
    { name: "Heygen", description: "HeyGen is an innovative video platform that harnesses the power of generative AI to streamline your video creation process.", vendor: "heygen", category: "ai-video", icon: "📹" },

    // Cryptocurrency
    { name: "Coinbase", description: "Coinbase is a platform for buying, selling, transferring, and storing cryptocurrency.", vendor: "coinbase", category: "crypto", icon: "🪙" },
    { name: "Coinmarketcap", description: "CoinMarketCap provides a comprehensive cryptocurrency market data API, offering real-time and historical data on cryptocurrencies and exchanges.", vendor: "coinmarketcap", category: "crypto", icon: "📊" },
    { name: "Coinranking", description: "Coinranking provides a comprehensive API for accessing cryptocurrency market data, including coin prices, market caps, and historical data.", vendor: "coinranking", category: "crypto", icon: "📊" },
    { name: "Token metrics", description: "Token Metrics provides an API offering real-time, AI-powered cryptocurrency data and insights for developers to build trading bots, dashboards, and portfolio tools.", vendor: "tokenmetrics", category: "crypto", icon: "📊" },

    // Workflow automation
    { name: "Bannerbear", description: "Bannerbear offers an automated image and video generation API, allowing businesses to create graphics, social media visuals, and marketing collateral with customizable templates at scale.", vendor: "bannerbear", category: "workflow", icon: "🐻" },
    { name: "Process street", description: "Process Street supports creating and running checklists, SOPs, and workflows, helping teams automate recurring processes and track compliance.", vendor: "processstreet", category: "workflow", icon: "📋" },
    { name: "Workiom", description: "Workiom allows businesses to create custom workflows, integrate apps, and automate processes, reducing manual overhead and streamlining operations.", vendor: "workiom", category: "workflow", icon: "📋" },
    { name: "Formsite", description: "Formsite helps users create online forms and surveys with drag-and-drop tools, secure data capture, and integrations to simplify workflows.", vendor: "formsite", category: "workflow", icon: "📄" },
    { name: "Servicem8", description: "ServiceM8 helps field service businesses schedule jobs, send quotes, and manage invoices, offering staff mobile apps and real-time job status tracking.", vendor: "servicem8", category: "workflow", icon: "🛠️" },

    // Hr & recruiting
    { name: "Lever", description: "Lever is an applicant tracking system combining sourcing, CRM functionalities, and analytics, helping companies scale recruiting efforts with a collaborative approach.", vendor: "lever", category: "hr", icon: "💼" },
    { name: "Ashby", description: "Ashby delivers an applicant tracking system for modern teams, offering features like job postings, candidate management, and data-driven hiring insights to streamline the recruitment process.", vendor: "ashby", category: "hr", icon: "💼" }
];
