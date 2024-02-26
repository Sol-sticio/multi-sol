import React from 'react';
import styles from '../styles/Three.module.css';

const Instructions = ({ startGame }) => {
  return (
    <div className={styles.instructions}>
      <h1>Welcome to Solstice Space</h1>
      <p>
        A game that allows you to add solar directions on an anchor and display them in the empty solstice space as a cute and beautiful snowflake avatar.
      </p>
      <p>
        Use the WASD keys to move and F to connect transaction
      </p>
      <button onClick={startGame}>Start to Game</button>
    </div>
  );
};

export default Instructions;
