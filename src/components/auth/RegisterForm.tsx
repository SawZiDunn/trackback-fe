import { ArrowRight, KeyRound } from "lucide-react";
import { Button } from "../common/button";
import { AuthField } from "./AuthField";

export function RegisterForm() {
  return (
    <form className="space-y-5">
      <AuthField label="Full name" name="fullName" placeholder="Alex Morgan" />
      <AuthField
        label="Campus email"
        name="email"
        placeholder="netid@university.edu"
        type="email"
      />
      <AuthField
        label="Password"
        name="password"
        placeholder="Create a password"
        type="password"
        icon={<KeyRound aria-hidden="true" size={16} />}
      />
      <p className="text-xs leading-5 text-tertiary">
        Use your institutional email to create a verified campus account.
      </p>
      <Button
        type="submit"
        className="h-12 w-full text-sm font-semibold"
        icon={<ArrowRight aria-hidden="true" size={16} />}
      >
        Create TrackBack account
      </Button>
    </form>
  );
}
