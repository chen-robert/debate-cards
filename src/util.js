module.exports = {
  cleanData: data => {
    const ret = {};
    Object.keys(data).forEach(school => {
      ret[school] = {};
      Object.keys(data[school]).forEach(caseName => {
        const completeRounds = data[school][caseName].filter(round => round.docUrl !== undefined);
        if(completeRounds.length > 0){
          ret[school][caseName] = completeRounds;
        }
      });

      if(Object.keys(ret[school]).length === 0){
        delete ret[school];
      }
    });
    return ret;
  }
}
