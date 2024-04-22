import type { FC } from "hono/jsx";
import { Style } from "hono/css";

import styles from "./styles";

const Layout: FC = (props) => {
  return (
    <html>
      <head>
        <Style>{styles}</Style>
      </head>
      <body>{props.children}</body>
    </html>
  );
};

export default Layout;
