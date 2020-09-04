const rtl = new RegExp(/[\u0600-\u06FF]/);

const direction = (value: string) => {
  if (rtl.test(value)) {
    return 'rtl';
  }

  return 'ltr';
};

export default direction;
