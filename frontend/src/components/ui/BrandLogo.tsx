import primaryLogo from "@/assets/brand/omnitask-horizontal-primary.svg";
import whiteLogo from "@/assets/brand/omnitask-horizontal-white.svg";

type BrandLogoProps = Readonly<{ className?: string }>;

export function BrandLogo({ className = "" }: BrandLogoProps) {
  return (
    <span className={`inline-flex ${className}`}>
      <img className="h-auto w-full dark:hidden" src={primaryLogo} alt="OmniTask" />
      <img className="hidden h-auto w-full dark:block" src={whiteLogo} alt="OmniTask" />
    </span>
  );
}
