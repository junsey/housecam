export type TeamMember = {
  name: string;
  image: string;
  alt: string;
  objectPosition: string;
  linkedIn: string;
  email: string;
};

export const teamMembers: readonly TeamMember[] = [
  {
    name: "Miguel Lorea Tannfeld",
    image: "/team/miguel-lorea-tannfeld.png",
    alt: "Miguel Lorea Tannfeld, integrante de HouseCam",
    objectPosition: "50% 34%",
    linkedIn: "https://www.linkedin.com/in/miguel-lorea-tannfeld-194a5928a/",
    email: "loreatannfeldmiguel@gmail.com",
  },
  {
    name: "Rodrigo S. Salvay",
    image: "/team/rodrigo-s-salvay.png",
    alt: "Rodrigo S. Salvay, integrante de HouseCam",
    objectPosition: "50% 30%",
    linkedIn: "https://www.linkedin.com/in/rodrigo-sebastian-salvay/",
    email: "salvay.rs@gmail.com",
  },
] as const;
