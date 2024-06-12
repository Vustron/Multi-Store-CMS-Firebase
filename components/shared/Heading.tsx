"use client";

interface Props {
  title: string;
  description: string;
}

const Heading = ({ title, description }: Props) => {
  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      <span className="text-sm text-muted-foreground">{description}</span>
    </div>
  );
};

export default Heading;
