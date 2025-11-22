export type ToolCategory = 
  | 'browsers'
  | 'dev-tools' 
  | 'design-tools'
  | 'communication'
  | 'productivity'
  | 'languages'
  | 'devops'
  | 'databases'
  | 'terminal'
  | 'cli-tools'
  | 'media'
  | 'security'
  | 'utilities'
  | 'custom';export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon?: string;
  installCommand: string;
  type?: 'brew' | 'brew-cask' | 'mas' | 'npm' | 'custom';
  popular?: boolean;
  isHomebrew?: boolean;
  homepage?: string;
  version?: string;
}

export interface LanguageVersion {
  toolId: string;
  version: string;
  manager: 'nvm' | 'pyenv' | 'asdf' | 'sdkman';
}

export interface CustomScript {
  id: string;
  name: string;
  content: string;
  type: 'dotfile' | 'script';
}

export interface Selection {
  tools: Tool[];
  languageVersions: LanguageVersion[];
  customScripts: CustomScript[];
}
