import { Button } from "../common/Button";

export function RegisterButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return <Button onClick={onClick} disabled={disabled}>Register</Button>;
}
