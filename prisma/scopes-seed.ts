import { PrismaClient } from '@prisma/client';

interface ScopeDef {
  provider: string;
  scopeId: string;
  displayName: string;
  description: string;
  category: string;
  adminConsentRequired: boolean;
  accessLevel: string;
}

const GOOGLE_WORKSPACE_SCOPES: ScopeDef[] = [
  // ── Admin SDK ──
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/admin.directory.user',
    displayName: 'Admin Directory User',
    description: 'Read and write user data in the Admin SDK Directory',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/admin.directory.user.readonly',
    displayName: 'Admin Directory User (Read Only)',
    description: 'Read user data in the Admin SDK Directory',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/admin.directory.group',
    displayName: 'Admin Directory Group',
    description: 'Read and write group data in the Admin SDK Directory',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/admin.directory.group.readonly',
    displayName: 'Admin Directory Group (Read Only)',
    description: 'Read group data in the Admin SDK Directory',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/admin.directory.orgunit',
    displayName: 'Admin Directory Org Unit',
    description: 'Read and write organization unit data in the Admin SDK Directory',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/admin.directory.orgunit.readonly',
    displayName: 'Admin Directory Org Unit (Read Only)',
    description: 'Read organization unit data in the Admin SDK Directory',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/admin.directory.device.chromeos',
    displayName: 'Admin Directory ChromeOS Device',
    description: 'Read and write ChromeOS device data in the Admin SDK Directory',
    category: 'Device Management',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/admin.directory.device.chromeos.readonly',
    displayName: 'Admin Directory ChromeOS Device (Read Only)',
    description: 'Read ChromeOS device data in the Admin SDK Directory',
    category: 'Device Management',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/admin.directory.device.mobile',
    displayName: 'Admin Directory Mobile Device',
    description: 'Read and write mobile device data in the Admin SDK Directory',
    category: 'Device Management',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/admin.directory.device.mobile.readonly',
    displayName: 'Admin Directory Mobile Device (Read Only)',
    description: 'Read mobile device data in the Admin SDK Directory',
    category: 'Device Management',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/admin.reports.usage.readonly',
    displayName: 'Admin Reports Usage (Read Only)',
    description: 'Read usage reports from the Admin SDK Reports API',
    category: 'Logging & Monitoring',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/admin.reports.audit.readonly',
    displayName: 'Admin Reports Audit (Read Only)',
    description: 'Read audit reports from the Admin SDK Reports API',
    category: 'Logging & Monitoring',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/admin.settings.notification',
    displayName: 'Admin Settings Notification',
    description: 'Manage notification settings in the Admin SDK',
    category: 'Compliance & Governance',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/admin.settings.saml',
    displayName: 'Admin Settings SAML',
    description: 'Manage SAML settings in the Admin SDK',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/apps.order',
    displayName: 'Apps Order',
    description: 'Read and write order data for Google Workspace',
    category: 'Compliance & Governance',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/apps.order.readonly',
    displayName: 'Apps Order (Read Only)',
    description: 'Read order data for Google Workspace',
    category: 'Compliance & Governance',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/apps.groups',
    displayName: 'Apps Groups Settings',
    description: 'Read and write Groups settings for Google Workspace',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/apps.groups.readonly',
    displayName: 'Apps Groups Settings (Read Only)',
    description: 'Read Groups settings for Google Workspace',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'read',
  },

  // ── Gmail API ──
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/gmail.readonly',
    displayName: 'Gmail Read Only',
    description: 'Read Gmail messages and settings',
    category: 'Email Security',
    adminConsentRequired: false,
    accessLevel: 'read',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/gmail.modify',
    displayName: 'Gmail Modify',
    description: 'Read, compose, and modify Gmail messages and settings',
    category: 'Email Security',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/gmail.send',
    displayName: 'Gmail Send',
    description: 'Send Gmail messages',
    category: 'Email Security',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/gmail.labels',
    displayName: 'Gmail Labels',
    description: 'Read and write Gmail labels',
    category: 'Email Security',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/gmail.settings.basic',
    displayName: 'Gmail Basic Settings',
    description: 'Read and modify basic Gmail settings',
    category: 'Email Security',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/gmail.settings.sharing',
    displayName: 'Gmail Sharing Settings',
    description: 'Read and modify Gmail delegation and sharing settings',
    category: 'Email Security',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/gmail.metadata',
    displayName: 'Gmail Metadata',
    description: 'Read Gmail message metadata, labels, and sizes',
    category: 'Email Security',
    adminConsentRequired: false,
    accessLevel: 'read',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/gmail.settings.basic.readonly',
    displayName: 'Gmail Basic Settings (Read Only)',
    description: 'Read basic Gmail settings',
    category: 'Email Security',
    adminConsentRequired: false,
    accessLevel: 'read',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/gmail.settings.sharing.readonly',
    displayName: 'Gmail Sharing Settings (Read Only)',
    description: 'Read Gmail delegation and sharing settings',
    category: 'Email Security',
    adminConsentRequired: false,
    accessLevel: 'read',
  },

  // ── Google Drive API ──
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/drive',
    displayName: 'Google Drive (Full Access)',
    description: 'Full access to all Google Drive files and settings',
    category: 'File & Storage Security',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/drive.readonly',
    displayName: 'Google Drive (Read Only)',
    description: 'Read all Google Drive files',
    category: 'File & Storage Security',
    adminConsentRequired: false,
    accessLevel: 'read',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/drive.file',
    displayName: 'Google Drive (Per-file Access)',
    description: 'Access files that have been opened by the app',
    category: 'File & Storage Security',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/drive.metadata.readonly',
    displayName: 'Google Drive Metadata (Read Only)',
    description: 'Read Google Drive file metadata and settings',
    category: 'File & Storage Security',
    adminConsentRequired: false,
    accessLevel: 'read',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/drive.metadata',
    displayName: 'Google Drive Metadata',
    description: 'Read and write Google Drive file metadata and settings',
    category: 'File & Storage Security',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/drive.apps.readonly',
    displayName: 'Google Drive Installed Apps (Read Only)',
    description: 'Read the list of Google Drive apps installed by the user',
    category: 'File & Storage Security',
    adminConsentRequired: false,
    accessLevel: 'read',
  },

  // ── Google Calendar API ──
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/calendar',
    displayName: 'Google Calendar (Full Access)',
    description: 'Read and write access to all Google Calendar events and settings',
    category: 'Calendar & Scheduling',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/calendar.readonly',
    displayName: 'Google Calendar (Read Only)',
    description: 'Read access to all Google Calendar events and settings',
    category: 'Calendar & Scheduling',
    adminConsentRequired: false,
    accessLevel: 'read',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/calendar.events',
    displayName: 'Google Calendar Events',
    description: 'Read and write access to Google Calendar events',
    category: 'Calendar & Scheduling',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/calendar.events.readonly',
    displayName: 'Google Calendar Events (Read Only)',
    description: 'Read access to Google Calendar events',
    category: 'Calendar & Scheduling',
    adminConsentRequired: false,
    accessLevel: 'read',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/calendar.settings.readonly',
    displayName: 'Google Calendar Settings (Read Only)',
    description: 'Read access to Google Calendar settings',
    category: 'Calendar & Scheduling',
    adminConsentRequired: false,
    accessLevel: 'read',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/calendar.calendarlist.readonly',
    displayName: 'Google Calendar List (Read Only)',
    description: 'Read the list of calendars the user has access to',
    category: 'Calendar & Scheduling',
    adminConsentRequired: false,
    accessLevel: 'read',
  },

  // ── Google Chat API ──
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/chat.messages',
    displayName: 'Google Chat Messages',
    description: 'Read and create messages in Google Chat',
    category: 'Team & Collaboration',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/chat.messages.readonly',
    displayName: 'Google Chat Messages (Read Only)',
    description: 'Read messages in Google Chat',
    category: 'Team & Collaboration',
    adminConsentRequired: false,
    accessLevel: 'read',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/chat.spaces',
    displayName: 'Google Chat Spaces',
    description: 'Read and manage spaces in Google Chat',
    category: 'Team & Collaboration',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/chat.spaces.readonly',
    displayName: 'Google Chat Spaces (Read Only)',
    description: 'Read spaces in Google Chat',
    category: 'Team & Collaboration',
    adminConsentRequired: false,
    accessLevel: 'read',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/chat.memberships',
    displayName: 'Google Chat Memberships',
    description: 'Read and manage memberships in Google Chat',
    category: 'Team & Collaboration',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/chat.memberships.readonly',
    displayName: 'Google Chat Memberships (Read Only)',
    description: 'Read memberships in Google Chat',
    category: 'Team & Collaboration',
    adminConsentRequired: false,
    accessLevel: 'read',
  },

  // ── Google Meet API ──
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/meetings.space.created',
    displayName: 'Google Meet Create Spaces',
    description: 'Create and manage Google Meet spaces',
    category: 'Team & Collaboration',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/meetings.space.readonly',
    displayName: 'Google Meet Spaces (Read Only)',
    description: 'Read information about Google Meet spaces',
    category: 'Team & Collaboration',
    adminConsentRequired: false,
    accessLevel: 'read',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/meetings.recording',
    displayName: 'Google Meet Recording',
    description: 'Manage Google Meet recordings',
    category: 'Team & Collaboration',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/meetings.transcript',
    displayName: 'Google Meet Transcript',
    description: 'Manage Google Meet transcripts',
    category: 'Team & Collaboration',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },

  // ── Google People API ──
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/contacts',
    displayName: 'Google Contacts',
    description: 'Read and write Google Contacts',
    category: 'Identity & Access',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/contacts.readonly',
    displayName: 'Google Contacts (Read Only)',
    description: 'Read Google Contacts',
    category: 'Identity & Access',
    adminConsentRequired: false,
    accessLevel: 'read',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/directory.readonly',
    displayName: 'Google People Directory (Read Only)',
    description: 'Read the domain directory profile of users',
    category: 'Identity & Access',
    adminConsentRequired: false,
    accessLevel: 'read',
  },

  // ── Google Tasks API ──
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/tasks',
    displayName: 'Google Tasks',
    description: 'Read and write Google Tasks',
    category: 'Team & Collaboration',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/tasks.readonly',
    displayName: 'Google Tasks (Read Only)',
    description: 'Read Google Tasks',
    category: 'Team & Collaboration',
    adminConsentRequired: false,
    accessLevel: 'read',
  },

  // ── Google Vault API ──
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/ediscovery',
    displayName: 'Google Vault eDiscovery',
    description: 'Use Google Vault for eDiscovery exports and searches',
    category: 'Records & eDiscovery',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/vault.holds',
    displayName: 'Google Vault Holds',
    description: 'Manage retention holds in Google Vault',
    category: 'Records & eDiscovery',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },

  // ── Google Sheets / Docs / Slides ──
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/spreadsheets',
    displayName: 'Google Sheets',
    description: 'Read and write access to Google Sheets',
    category: 'File & Storage Security',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    displayName: 'Google Sheets (Read Only)',
    description: 'Read-only access to Google Sheets',
    category: 'File & Storage Security',
    adminConsentRequired: false,
    accessLevel: 'read',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/documents',
    displayName: 'Google Docs',
    description: 'Read and write access to Google Docs',
    category: 'File & Storage Security',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/documents.readonly',
    displayName: 'Google Docs (Read Only)',
    description: 'Read-only access to Google Docs',
    category: 'File & Storage Security',
    adminConsentRequired: false,
    accessLevel: 'read',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/presentations',
    displayName: 'Google Slides',
    description: 'Read and write access to Google Slides',
    category: 'File & Storage Security',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/presentations.readonly',
    displayName: 'Google Slides (Read Only)',
    description: 'Read-only access to Google Slides',
    category: 'File & Storage Security',
    adminConsentRequired: false,
    accessLevel: 'read',
  },

  // ── Google Cloud Search ──
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/cloud_search',
    displayName: 'Google Cloud Search (Full)',
    description: 'Full access to Google Cloud Search APIs',
    category: 'Cloud & Infrastructure',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/cloud_search.query',
    displayName: 'Google Cloud Search Query',
    description: 'Query-only access to Google Cloud Search',
    category: 'Cloud & Infrastructure',
    adminConsentRequired: false,
    accessLevel: 'read',
  },

  // ── Google Classroom ──
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/classroom.courses.readonly',
    displayName: 'Google Classroom Courses (Read Only)',
    description: 'Read Google Classroom courses',
    category: 'Team & Collaboration',
    adminConsentRequired: false,
    accessLevel: 'read',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/classroom.coursework',
    displayName: 'Google Classroom Coursework',
    description: 'Read and write Google Classroom coursework',
    category: 'Team & Collaboration',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'google',
    scopeId: 'https://www.googleapis.com/auth/classroom.rosters',
    displayName: 'Google Classroom Rosters',
    description: 'Read Google Classroom rosters and student info',
    category: 'Team & Collaboration',
    adminConsentRequired: false,
    accessLevel: 'read',
  },
];

const MS_GRAPH_SCOPES: ScopeDef[] = [
  // ── Identity & Access Management ──
  {
    provider: 'microsoft',
    scopeId: 'User.Read',
    displayName: 'User.Read',
    description: 'Read user profile',
    category: 'Identity & Access',
    adminConsentRequired: false,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'User.ReadWrite',
    displayName: 'User.ReadWrite',
    description: 'Read and write user profile',
    category: 'Identity & Access',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'User.Read.All',
    displayName: 'User.Read.All',
    description: 'Read all users\u2019 full profiles',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'User.ReadWrite.All',
    displayName: 'User.ReadWrite.All',
    description: 'Read and write all users\u2019 full profiles',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'User.Export',
    displayName: 'User.Export',
    description: 'Export user data',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'UserAuthenticationMethod.Read',
    displayName: 'UserAuthenticationMethod.Read',
    description: 'Read user authentication methods',
    category: 'Identity & Access',
    adminConsentRequired: false,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'UserAuthenticationMethod.ReadWrite',
    displayName: 'UserAuthenticationMethod.ReadWrite',
    description: 'Read and write user authentication methods',
    category: 'Identity & Access',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'UserAuthenticationMethod.Read.All',
    displayName: 'UserAuthenticationMethod.Read.All',
    description: 'Read all users\u2019 authentication methods',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'UserAuthenticationMethod.ReadWrite.All',
    displayName: 'UserAuthenticationMethod.ReadWrite.All',
    description: 'Read and write all users\u2019 authentication methods',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'Group.Read.All',
    displayName: 'Group.Read.All',
    description: 'Read all groups',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'Group.ReadWrite.All',
    displayName: 'Group.ReadWrite.All',
    description: 'Read and write all groups',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'GroupMember.Read.All',
    displayName: 'GroupMember.Read.All',
    description: 'Read group memberships',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'GroupMember.ReadWrite.All',
    displayName: 'GroupMember.ReadWrite.All',
    description: 'Read and write group memberships',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'Directory.Read.All',
    displayName: 'Directory.Read.All',
    description: 'Read directory data',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'Directory.ReadWrite.All',
    displayName: 'Directory.ReadWrite.All',
    description: 'Read and write directory data',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'AdministrativeUnit.Read.All',
    displayName: 'AdministrativeUnit.Read.All',
    description: 'Read administrative units',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'AdministrativeUnit.ReadWrite.All',
    displayName: 'AdministrativeUnit.ReadWrite.All',
    description: 'Read and write administrative units',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'Application.Read.All',
    displayName: 'Application.Read.All',
    description: 'Read applications',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'Application.ReadWrite.All',
    displayName: 'Application.ReadWrite.All',
    description: 'Read and write applications',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'AppRoleAssignment.ReadWrite.All',
    displayName: 'AppRoleAssignment.ReadWrite.All',
    description: 'Manage app role assignments',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'AccessReview.Read.All',
    displayName: 'AccessReview.Read.All',
    description: 'Read access reviews',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'AccessReview.ReadWrite.All',
    displayName: 'AccessReview.ReadWrite.All',
    description: 'Read and write access reviews',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'Organization.Read.All',
    displayName: 'Organization.Read.All',
    description: 'Read organization information',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'Organization.ReadWrite.All',
    displayName: 'Organization.ReadWrite.All',
    description: 'Read and write organization information',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'RoleManagement.Read.All',
    displayName: 'RoleManagement.Read.All',
    description: 'Read directory role assignments',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'RoleManagement.ReadWrite.All',
    displayName: 'RoleManagement.ReadWrite.All',
    description: 'Read and write directory role assignments',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'RoleManagement.ReadWrite.Directory',
    displayName: 'RoleManagement.ReadWrite.Directory',
    description: 'Read and write directory role assignments',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'PrivilegedAccess.ReadWrite.AzureResources',
    displayName: 'PrivilegedAccess.ReadWrite.AzureResources',
    description: 'Manage privileged access to Azure resources',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'PrivilegedAccess.ReadWrite.AzureADGroups',
    displayName: 'PrivilegedAccess.ReadWrite.AzureADGroups',
    description: 'Manage privileged access to Azure AD groups',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'PrivilegedAccess.ReadWrite.AzureADGroupSettings',
    displayName: 'PrivilegedAccess.ReadWrite.AzureADGroupSettings',
    description: 'Manage privileged access group settings',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },

  // ── Mail & Calendar ──
  {
    provider: 'microsoft',
    scopeId: 'Mail.Read',
    displayName: 'Mail.Read',
    description: 'Read user mail',
    category: 'Email Security',
    adminConsentRequired: false,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'Mail.ReadWrite',
    displayName: 'Mail.ReadWrite',
    description: 'Read and write user mail',
    category: 'Email Security',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'Mail.Send',
    displayName: 'Mail.Send',
    description: 'Send mail as user',
    category: 'Email Security',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'Mail.ReadWrite.All',
    displayName: 'Mail.ReadWrite.All',
    description: 'Read and write all users\u2019 mail',
    category: 'Email Security',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'MailboxSettings.Read',
    displayName: 'MailboxSettings.Read',
    description: 'Read user mailbox settings',
    category: 'Email Security',
    adminConsentRequired: false,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'MailboxSettings.ReadWrite',
    displayName: 'MailboxSettings.ReadWrite',
    description: 'Read and write user mailbox settings',
    category: 'Email Security',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'Calendars.Read',
    displayName: 'Calendars.Read',
    description: 'Read user calendars',
    category: 'Calendar & Scheduling',
    adminConsentRequired: false,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'Calendars.ReadWrite',
    displayName: 'Calendars.ReadWrite',
    description: 'Read and write user calendars',
    category: 'Calendar & Scheduling',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'Calendars.ReadWrite.Shared',
    displayName: 'Calendars.ReadWrite.Shared',
    description: 'Read and write shared calendars',
    category: 'Calendar & Scheduling',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'Calendars.Read.Shared',
    displayName: 'Calendars.Read.Shared',
    description: 'Read shared calendars',
    category: 'Calendar & Scheduling',
    adminConsentRequired: false,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'Places.Read.All',
    displayName: 'Places.Read.All',
    description: 'Read all places',
    category: 'Calendar & Scheduling',
    adminConsentRequired: true,
    accessLevel: 'read',
  },

  // ── Files & Data ──
  {
    provider: 'microsoft',
    scopeId: 'Files.Read',
    displayName: 'Files.Read',
    description: 'Read user files',
    category: 'File & Storage Security',
    adminConsentRequired: false,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'Files.ReadWrite',
    displayName: 'Files.ReadWrite',
    description: 'Read and write user files',
    category: 'File & Storage Security',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'Files.Read.All',
    displayName: 'Files.Read.All',
    description: 'Read all files across all file storage',
    category: 'File & Storage Security',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'Files.ReadWrite.All',
    displayName: 'Files.ReadWrite.All',
    description: 'Read and write all files across all file storage',
    category: 'File & Storage Security',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'Files.ReadWrite.AppFolder',
    displayName: 'Files.ReadWrite.AppFolder',
    description: 'Read and write files in the app\u2019s folder',
    category: 'File & Storage Security',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'Sites.Read.All',
    displayName: 'Sites.Read.All',
    description: 'Read SharePoint site collections and metadata',
    category: 'File & Storage Security',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'Sites.ReadWrite.All',
    displayName: 'Sites.ReadWrite.All',
    description: 'Read and write SharePoint site collections and metadata',
    category: 'File & Storage Security',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'Sites.Selected',
    displayName: 'Sites.Selected',
    description: 'Access selected SharePoint sites',
    category: 'File & Storage Security',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'Notes.Read',
    displayName: 'Notes.Read',
    description: 'Read user OneNote notebooks',
    category: 'File & Storage Security',
    adminConsentRequired: false,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'Notes.ReadWrite',
    displayName: 'Notes.ReadWrite',
    description: 'Read and write user OneNote notebooks',
    category: 'File & Storage Security',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'Notes.ReadWrite.All',
    displayName: 'Notes.ReadWrite.All',
    description: 'Read and write all OneNote notebooks',
    category: 'File & Storage Security',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'Bookmarks.Read.All',
    displayName: 'Bookmarks.Read.All',
    description: 'Read all user bookmarks',
    category: 'File & Storage Security',
    adminConsentRequired: true,
    accessLevel: 'read',
  },

  // ── Teams & Collaboration ──
  {
    provider: 'microsoft',
    scopeId: 'Team.Create',
    displayName: 'Team.Create',
    description: 'Create teams',
    category: 'Team & Collaboration',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'Team.ReadBasic.All',
    displayName: 'Team.ReadBasic.All',
    description: 'Read all teams\u2019 basic properties',
    category: 'Team & Collaboration',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'TeamSettings.Read.All',
    displayName: 'TeamSettings.Read.All',
    description: 'Read all team settings',
    category: 'Team & Collaboration',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'TeamSettings.ReadWrite.All',
    displayName: 'TeamSettings.ReadWrite.All',
    description: 'Read and write all team settings',
    category: 'Team & Collaboration',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'ChannelMessage.Read.All',
    displayName: 'ChannelMessage.Read.All',
    description: 'Read all channel messages',
    category: 'Team & Collaboration',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'Chat.Read',
    displayName: 'Chat.Read',
    description: 'Read user chats',
    category: 'Team & Collaboration',
    adminConsentRequired: false,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'Chat.ReadWrite',
    displayName: 'Chat.ReadWrite',
    description: 'Read and write user chats',
    category: 'Team & Collaboration',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'Chat.ReadWrite.All',
    displayName: 'Chat.ReadWrite.All',
    description: 'Read and write all chats',
    category: 'Team & Collaboration',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'OnlineMeeting.Read.All',
    displayName: 'OnlineMeeting.Read.All',
    description: 'Read all online meetings',
    category: 'Team & Collaboration',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'OnlineMeeting.ReadWrite.All',
    displayName: 'OnlineMeeting.ReadWrite.All',
    description: 'Read and write all online meetings',
    category: 'Team & Collaboration',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },

  // ── Security & Compliance ──
  {
    provider: 'microsoft',
    scopeId: 'SecurityEvents.Read.All',
    displayName: 'SecurityEvents.Read.All',
    description: 'Read all security events',
    category: 'Security Operations',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'SecurityEvents.ReadWrite.All',
    displayName: 'SecurityEvents.ReadWrite.All',
    description: 'Read and write security events',
    category: 'Security Operations',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'ThreatIndicators.Read.All',
    displayName: 'ThreatIndicators.Read.All',
    description: 'Read threat indicators',
    category: 'Security Operations',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'ThreatIndicators.ReadWrite.All',
    displayName: 'ThreatIndicators.ReadWrite.All',
    description: 'Read and write threat indicators',
    category: 'Security Operations',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'AuditLog.Read.All',
    displayName: 'AuditLog.Read.All',
    description: 'Read all audit log properties',
    category: 'Logging & Monitoring',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'SecurityActions.Read.All',
    displayName: 'SecurityActions.Read.All',
    description: 'Read security actions',
    category: 'Security Operations',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'SecurityActions.ReadWrite.All',
    displayName: 'SecurityActions.ReadWrite.All',
    description: 'Read and write security actions',
    category: 'Security Operations',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'AttackSimulation.Read.All',
    displayName: 'AttackSimulation.Read.All',
    description: 'Read attack simulation campaigns',
    category: 'Security Operations',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'AttackSimulation.ReadWrite.All',
    displayName: 'AttackSimulation.ReadWrite.All',
    description: 'Read and write attack simulation campaigns',
    category: 'Security Operations',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'Alerts.Read.All',
    displayName: 'Alerts.Read.All',
    description: 'Read all alerts',
    category: 'Security Operations',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'Alerts.ReadWrite.All',
    displayName: 'Alerts.ReadWrite.All',
    description: 'Read and write all alerts',
    category: 'Security Operations',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'InformationProtection.Read',
    displayName: 'InformationProtection.Read',
    description: 'Read information protection policies and labels',
    category: 'Data Protection',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'InformationProtection.ReadWrite',
    displayName: 'InformationProtection.ReadWrite',
    description: 'Read and write information protection policies and labels',
    category: 'Data Protection',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'RecordsManagement.Read.All',
    displayName: 'RecordsManagement.Read.All',
    description: 'Read records management',
    category: 'Records & eDiscovery',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'RecordsManagement.ReadWrite.All',
    displayName: 'RecordsManagement.ReadWrite.All',
    description: 'Read and write records management',
    category: 'Records & eDiscovery',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },

  // ── Device Management ──
  {
    provider: 'microsoft',
    scopeId: 'DeviceManagementManagedDevices.Read.All',
    displayName: 'DeviceManagementManagedDevices.Read.All',
    description: 'Read managed devices',
    category: 'Device Management',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'DeviceManagementManagedDevices.ReadWrite.All',
    displayName: 'DeviceManagementManagedDevices.ReadWrite.All',
    description: 'Read and write managed devices',
    category: 'Device Management',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'DeviceManagementConfiguration.Read.All',
    displayName: 'DeviceManagementConfiguration.Read.All',
    description: 'Read device configuration profiles',
    category: 'Device Management',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'DeviceManagementConfiguration.ReadWrite.All',
    displayName: 'DeviceManagementConfiguration.ReadWrite.All',
    description: 'Read and write device configuration profiles',
    category: 'Device Management',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'Device.Read.All',
    displayName: 'Device.Read.All',
    description: 'Read all devices',
    category: 'Device Management',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'Device.ReadWrite.All',
    displayName: 'Device.ReadWrite.All',
    description: 'Read and write all devices',
    category: 'Device Management',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'Device.ReadWrite.ConditionalAccess',
    displayName: 'Device.ReadWrite.ConditionalAccess',
    description: 'Read and write conditional access policies',
    category: 'Device Management',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },

  // ── Reporting & Analytics ──
  {
    provider: 'microsoft',
    scopeId: 'Reports.Read.All',
    displayName: 'Reports.Read.All',
    description: 'Read all reports',
    category: 'Logging & Monitoring',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'Analytics.Read',
    displayName: 'Analytics.Read',
    description: 'Read user analytics data',
    category: 'Logging & Monitoring',
    adminConsentRequired: false,
    accessLevel: 'read',
  },

  // ── Chat, Meet, Tasks ──
  {
    provider: 'microsoft',
    scopeId: 'ChatMessage.Read',
    displayName: 'ChatMessage.Read',
    description: 'Read chat messages (deprecated)',
    category: 'Team & Collaboration',
    adminConsentRequired: false,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'Tasks.Read',
    displayName: 'Tasks.Read',
    description: 'Read user tasks and task lists',
    category: 'Team & Collaboration',
    adminConsentRequired: false,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'Tasks.ReadWrite',
    displayName: 'Tasks.ReadWrite',
    description: 'Read and write user tasks and task lists',
    category: 'Team & Collaboration',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'Tasks.ReadWrite.All',
    displayName: 'Tasks.ReadWrite.All',
    description: 'Read and write all tasks and task lists',
    category: 'Team & Collaboration',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'ChannelMessage.Send',
    displayName: 'ChannelMessage.Send',
    description: 'Send channel messages',
    category: 'Team & Collaboration',
    adminConsentRequired: false,
    accessLevel: 'readwrite',
  },

  // ── Application & Integration ──
  {
    provider: 'microsoft',
    scopeId: 'ServiceMessage.Read.All',
    displayName: 'ServiceMessage.Read.All',
    description: 'Read service messages',
    category: 'Cloud & Infrastructure',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'ServiceHealth.Read.All',
    displayName: 'ServiceHealth.Read.All',
    description: 'Read service health information',
    category: 'Cloud & Infrastructure',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'Agreements.Read.All',
    displayName: 'Agreements.Read.All',
    description: 'Read agreements',
    category: 'Compliance & Governance',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'Agreements.ReadWrite.All',
    displayName: 'Agreements.ReadWrite.All',
    description: 'Read and write agreements',
    category: 'Compliance & Governance',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'AgreementAcceptance.Read.All',
    displayName: 'AgreementAcceptance.Read.All',
    description: 'Read agreement acceptances',
    category: 'Compliance & Governance',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'APIConnectors.Read.All',
    displayName: 'APIConnectors.Read.All',
    description: 'Read API connectors',
    category: 'Cloud & Infrastructure',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'APIConnectors.ReadWrite.All',
    displayName: 'APIConnectors.ReadWrite.All',
    description: 'Read and write API connectors',
    category: 'Cloud & Infrastructure',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'Policy.Read.All',
    displayName: 'Policy.Read.All',
    description: 'Read policies',
    category: 'Compliance & Governance',
    adminConsentRequired: true,
    accessLevel: 'read',
  },
  {
    provider: 'microsoft',
    scopeId: 'Policy.ReadWrite.Application',
    displayName: 'Policy.ReadWrite.Application',
    description: 'Read and write application policies',
    category: 'Compliance & Governance',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
  {
    provider: 'microsoft',
    scopeId: 'Policy.ReadWrite.ConditionalAccess',
    displayName: 'Policy.ReadWrite.ConditionalAccess',
    description: 'Read and write conditional access policies',
    category: 'Identity & Access',
    adminConsentRequired: true,
    accessLevel: 'readwrite',
  },
];

interface ThemeKeywordMap {
  category: string;
  keywords: string[];
  justification: string;
  riskLevel: string;
}

const CATEGORY_THEME_MAP: ThemeKeywordMap[] = [
  {
    category: 'Identity & Access',
    keywords: [
      'access control', 'access management', 'identity', 'account',
      'password', 'authentication', 'authorization', 'least privilege',
      'segregation', 'privileged', 'user identification', 'unique user',
    ],
    justification: 'OAuth scope governs identity and access management capabilities that directly impact user provisioning, authentication, and authorization controls.',
    riskLevel: 'high',
  },
  {
    category: 'Email Security',
    keywords: [
      'email', 'mail', 'communication', 'data leakage',
      'data protection', 'information transfer',
    ],
    justification: 'OAuth scope provides access to email data and messaging capabilities relevant to communication security, data leakage prevention, and information transfer controls.',
    riskLevel: 'medium',
  },
  {
    category: 'Data Protection',
    keywords: [
      'data protection', 'data handling', 'data leakage', 'classification',
      'encryption', 'confidentiality', 'integrity', 'privacy', 'dlp',
      'media', 'data at rest', 'data in transit', 'transmission',
    ],
    justification: 'OAuth scope provides access to data protection mechanisms relevant to data handling, classification, encryption, and privacy controls.',
    riskLevel: 'high',
  },
  {
    category: 'File & Storage Security',
    keywords: [
      'asset', 'inventory', 'data protection', 'data handling',
      'classification', 'encryption', 'storage', 'backup',
    ],
    justification: 'OAuth scope grants file and storage access that impacts asset management, data handling, classification, and backup controls.',
    riskLevel: 'medium',
  },
  {
    category: 'Calendar & Scheduling',
    keywords: [
      'data protection', 'availability', 'information transfer', 'confidentiality',
    ],
    justification: 'OAuth scope grants access to calendar and scheduling data that may contain sensitive information requiring confidentiality and availability controls.',
    riskLevel: 'low',
  },
  {
    category: 'Device Management',
    keywords: [
      'mobile', 'device', 'byod', 'asset', 'physical',
      'endpoint', 'workstation',
    ],
    justification: 'OAuth scope provides device management capabilities that affect mobile, endpoint, and physical asset security controls.',
    riskLevel: 'medium',
  },
  {
    category: 'Logging & Monitoring',
    keywords: [
      'logging', 'monitoring', 'audit', 'log',
      'event', 'detection', 'siem', 'timestamp',
    ],
    justification: 'OAuth scope enables access to audit logs, event data, and monitoring capabilities essential for security detection and SIEM controls.',
    riskLevel: 'medium',
  },
  {
    category: 'Compliance & Governance',
    keywords: [
      'governance', 'policy', 'compliance', 'audit',
      'review', 'documentation', 'ims', 'risk', 'management review',
      'internal audit',
    ],
    justification: 'OAuth scope affects compliance and governance capabilities including policy enforcement, audit trails, and management review controls.',
    riskLevel: 'medium',
  },
  {
    category: 'Incident Response',
    keywords: [
      'incident', 'breach', 'forensics', 'evidence',
      'notification', 'communication',
    ],
    justification: 'OAuth scope may impact incident response capabilities including evidence collection, breach notification, and forensic investigation.',
    riskLevel: 'high',
  },
  {
    category: 'Cloud & Infrastructure',
    keywords: [
      'cloud', 'network', 'configuration', 'baseline',
      'secure config', 'change management', 'vulnerability', 'patch',
    ],
    justification: 'OAuth scope grants cloud and infrastructure access relevant to secure configuration, change management, and vulnerability management controls.',
    riskLevel: 'medium',
  },
  {
    category: 'Team & Collaboration',
    keywords: [
      'acceptable use', 'personnel', 'training', 'awareness',
      'data protection', 'information transfer',
    ],
    justification: 'OAuth scope provides collaboration platform access that impacts acceptable use, personnel security, awareness training, and information transfer controls.',
    riskLevel: 'low',
  },
  {
    category: 'Security Operations',
    keywords: [
      'security', 'threat', 'malware', 'vulnerability',
      'penetration', 'incident', 'intrusion', 'firewall', 'network',
    ],
    justification: 'OAuth scope enables security operations capabilities including threat detection, vulnerability management, and incident response controls.',
    riskLevel: 'high',
  },
  {
    category: 'Business Continuity',
    keywords: [
      'business continuity', 'disaster recovery', 'backup',
      'restoration', 'availability', 'resilience', 'contingency',
    ],
    justification: 'OAuth scope may impact business continuity and disaster recovery capabilities including backup, restoration, and availability controls.',
    riskLevel: 'medium',
  },
  {
    category: 'Records & eDiscovery',
    keywords: [
      'retention', 'disposal', 'deletion', 'records',
      'documentation', 'legal', 'compliance', 'data protection',
    ],
    justification: 'OAuth scope provides records management and eDiscovery capabilities relevant to data retention, legal compliance, and disposal controls.',
    riskLevel: 'medium',
  },
];

function mapScopeCategoryToThemes(category: string): ThemeKeywordMap[] {
  return CATEGORY_THEME_MAP.filter((m) => m.category === category);
}

function buildJustification(
  scopeDisplayName: string,
  provider: string,
  controlTheme: string,
  baseJustification: string,
): string {
  return (
    'The ' +
    provider +
    ' OAuth scope "' +
    scopeDisplayName +
    '" is relevant to controls addressing "' +
    controlTheme +
    '". ' +
    baseJustification
  );
}

export async function seedScopes(prisma: PrismaClient): Promise<void> {
  console.log('Starting OAuth scopes seed...');

  // 1. Idempotent cleanup
  console.log('Deleting existing ScopeMapping records...');
  await prisma.scopeMapping.deleteMany();
  console.log('Deleting existing Scope records...');
  await prisma.scope.deleteMany();

  // 2. Insert all scopes
  const allScopes = [...GOOGLE_WORKSPACE_SCOPES, ...MS_GRAPH_SCOPES];
  console.log('Inserting ' + allScopes.length + ' OAuth scopes...');

  const insertedScopes = await prisma.$transaction(
    allScopes.map((s) =>
      prisma.scope.create({
        data: {
          provider: s.provider,
          scopeId: s.scopeId,
          displayName: s.displayName,
          description: s.description,
          category: s.category,
          adminConsentRequired: s.adminConsentRequired,
          accessLevel: s.accessLevel,
        },
      }),
    ),
  );

  console.log('Inserted ' + insertedScopes.length + ' scopes successfully.');

  // 3. Query all existing controls
  const controls = await prisma.control.findMany();
  console.log('Found ' + controls.length + ' existing controls for mapping.');

  if (controls.length === 0) {
    console.log('No controls found in database. Skipping scope-to-control mapping.');
    console.log('Seeded ' + insertedScopes.length + ' scopes and 0 scope-to-control mappings.');
    return;
  }

  // 4. Build scope-to-control mappings using keyword matching
  const scopeMappings: Array<{
    scopeId: string;
    controlId: string;
    justification: string;
    riskLevel: string;
  }> = [];

  const uniquePairs = new Set<string>();

  for (const scope of insertedScopes) {
    const themeMaps = mapScopeCategoryToThemes(scope.category);

    for (const themeMap of themeMaps) {
      for (const control of controls) {
        const controlThemeLower = control.theme.toLowerCase();
        const matched = themeMap.keywords.some(
          (kw) => controlThemeLower.includes(kw.toLowerCase()),
        );

        if (matched) {
          const pairKey = scope.id + ':' + control.id;
          if (!uniquePairs.has(pairKey)) {
            uniquePairs.add(pairKey);
            scopeMappings.push({
              scopeId: scope.id,
              controlId: control.id,
              justification: buildJustification(
                scope.displayName,
                scope.provider,
                control.theme,
                themeMap.justification,
              ),
              riskLevel: themeMap.riskLevel,
            });
          }
        }
      }
    }
  }

  // 5. Insert scope mappings in batches to avoid too-large transactions
  const BATCH_SIZE = 200;
  let insertedMappings = 0;

  for (let i = 0; i < scopeMappings.length; i += BATCH_SIZE) {
    const batch = scopeMappings.slice(i, i + BATCH_SIZE);
    await prisma.$transaction(
      batch.map((m) =>
        prisma.scopeMapping.create({
          data: {
            scopeId: m.scopeId,
            controlId: m.controlId,
            justification: m.justification,
            riskLevel: m.riskLevel,
          },
        }),
      ),
    );
    insertedMappings += batch.length;
    console.log(
      'Inserted mapping batch: ' +
        insertedMappings +
        ' / ' +
        scopeMappings.length,
    );
  }

  console.log(
    'Seeded ' +
      insertedScopes.length +
      ' scopes and ' +
      insertedMappings +
      ' scope-to-control mappings',
  );
}

export async function seedScopesStandalone(): Promise<void> {
  const client = new PrismaClient();
  try {
    await seedScopes(client);
  } finally {
    await client.$disconnect();
  }
}