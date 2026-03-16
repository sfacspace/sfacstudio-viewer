const damp = (damping, dt)=>1 - Math.pow(damping, dt * 1000);

export { damp };
