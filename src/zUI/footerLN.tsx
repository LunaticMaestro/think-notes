import { FaLinkedin } from "react-icons/fa";

type LinkedInLinkProps = {
  username: string;
  url: string;
};

export function LinkedInLink({ username, url }: LinkedInLinkProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        color: "inherit",
        textDecoration: "none",
        cursor: "pointer",
      }}
    >
      <FaLinkedin size={20} color="#0A66C2" />
      <span>{username}</span>
    </a>
  );
}