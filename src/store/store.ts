import Storage from "react-native-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const storage = new Storage({
  size: 100,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
});

export const saveData = (
  key: string,
  data: { email: string; name: string; token: string }
) => {
  storage
    .save({
      key: key,
      data: {
        name: data.name,
        email: data.email,
        token: data.token,
      },
      expires: 1000 * 3600,
    })
    .then((result) => console.log("data saved to cache :-- ", result));
};

export type cacheData = {
  name?: string;
  email?: string;
  token?: string;
};

export const loadData = async (key: string): Promise<cacheData> => {
  try {
    const vals = await storage.load({
      key: key,
      autoSync: true,
      syncInBackground: true,
    });
    console.log(vals);
    return vals || {};
  } catch (error: any) {
    console.log("Error loading data:", error.message);
    return {};
  }
};

export const removeData = (key: string) => {
  storage
    .remove({
      key: key,
    })
    .then((result) => console.log("data removed :--", result));
};
