import Dashboard from "../../components/dashboard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Dashboard>{children}</Dashboard>;
}
