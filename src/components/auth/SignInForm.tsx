import { ArrowRight, Eye, KeyRound } from "lucide-react";
import { Button } from "../common/button";
import { AuthField } from "./AuthField";

export function SignInForm() {
  return (
    <form className="space-y-5">
      <AuthField label="Email" name="email" placeholder="netid@university.edu" type="email" />
      <AuthField
        label="Password"
        name="password"
        placeholder="Enter your password"
        type="password"
        icon={<KeyRound aria-hidden="true" size={16} />}
        trailingIcon={<Eye aria-hidden="true" size={15} />}
      />
      <div className="flex items-center justify-between gap-4 text-xs text-tertiary">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="remember"
            className="h-4 w-4 rounded border-neutral accent-primary"
          />
          Remember me
        </label>
        <Button type="button" variant="link" className="font-medium">
          Forgot password?
        </Button>
      </div>
      <Button
        type="submit"
        className="h-12 w-full text-sm font-semibold"
        icon={<ArrowRight aria-hidden="true" size={16} />}
      >
        Sign In to TrackBack
      </Button>
    </form>
  );
}
