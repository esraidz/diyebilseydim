import { useEffect, useState } from "react";

export function useTypewriter(text, speed = 90) {
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let t;
    if (!deleting && displayed.length < text.length)
      t = setTimeout(
        () => setDisplayed(text.slice(0, displayed.length + 1)),
        speed
      );
    else if (!deleting && displayed.length === text.length)
      t = setTimeout(() => setDeleting(true), 2800);
    else if (deleting && displayed.length > 0)
      t = setTimeout(
        () => setDisplayed(text.slice(0, displayed.length - 1)),
        speed / 2
      );
    else t = setTimeout(() => setDeleting(false), 500);
    return () => clearTimeout(t);
  }, [displayed, deleting, text, speed]);

  return displayed;
}
