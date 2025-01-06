function welcome(name: string): string {
  console.log(`Welcome ${name}`);
  const user = {
    name: 'Jestan',
  };
  const fname = user.name;
  return fname + ' ' + name;
}

welcome('Jestan');
