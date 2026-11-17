export default function PageHead({ title }: { title: string }) {
  return (
    <div className="container-site pb-8 pt-10 md:pb-12 md:pt-16">
      <h1 className="display flex items-center gap-4 text-[clamp(2.8rem,8vw,6.5rem)] text-navy">
        <span className="hidden h-[3px] w-12 bg-navy sm:block md:w-20" />{title}
      </h1>
    </div>
  );
}
