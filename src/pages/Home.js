import * as React from 'react';

// const random = (min, max) => Math.random() * max
// let digits = [];
// for (let i = 0; i< 20; i++) {
//   digits.push()
// }

export default function Home() {
  return (
    <div>
      Homeee
      <button
        onClick={() => {
          throw new Error('purposeful error');
        }}
      >
        Break the world
      </button>
    </div>
  );
}
