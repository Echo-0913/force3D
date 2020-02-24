import React, { useState } from 'react';
import styles from "./index.scss";
import ShowDemo from '../../components/demo/showdemo';

function IndexPage() {
  // const [count, setCount] = useState(0);
  return (
    <div className={styles.page}>
      <ShowDemo />
    </div>
  );
}
export default IndexPage;
