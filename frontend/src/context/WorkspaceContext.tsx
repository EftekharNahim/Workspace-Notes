import { createContext, useContext, useState } from "react";

type WorkspaceContextType = {
    workspaceId: number | null;
    name:string | null;
    setWorkspaceId: (id: number | null) => void;
    setWorkspaceName: (name: string | null) => void;
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
    const [workspaceId, setWorkspaceId] = useState<number | null>(null);
    const [name, setWorkspaceName] = useState<string | null>(null);

  return (
    <WorkspaceContext.Provider value={{ workspaceId, setWorkspaceId, name, setWorkspaceName }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  }
  return context;
}
