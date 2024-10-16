export const updateStatus = async (id, stat) => {
  return new Promise((resolve, reject) => {
    fetch(`/api/wf/updateStatus?id=${id}&status=${stat}`)
      .then((response) => {
        if (!response.ok) {
          reject(`API request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        resolve(data.data);
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
};
