import { Icon } from "@/components/ui/Icon";

export function PageHeader({
  title,
  subtitle,
  icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-md mb-lg">
      <div className="flex items-center gap-sm">
        {icon && (
          <div className="w-11 h-11 rounded-xl bg-primary-container/15 text-primary flex items-center justify-center">
            <Icon name={icon} filled />
          </div>
        )}
        <div>
          <h1 className="font-headline-lg text-headline-md md:text-headline-lg text-on-surface">{title}</h1>
          {subtitle && <p className="text-body-md text-on-surface-variant">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function ComingSoon({ feature }: { feature: string }) {
  return (
    <div className="bg-white rounded-xl border border-outline-variant p-2xl text-center">
      <Icon name="construction" size={48} className="text-outline-variant" />
      <p className="font-title-lg text-title-lg mt-md">{feature} is coming soon</p>
      <p className="text-body-md text-on-surface-variant mt-xs">
        This part of the ecosystem is being built. Check back shortly.
      </p>
    </div>
  );
}
