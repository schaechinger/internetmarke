export const formatDate = (date?: Date): { date: string; time: string } => {
  const timestamp = (date || new Date()).toISOString().split('T');

  return {
    date: timestamp[0],
    time: `${timestamp[1].substr(0, 12)}+00:00`
  };
};
