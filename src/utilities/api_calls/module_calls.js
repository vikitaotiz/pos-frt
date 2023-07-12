import { base_url } from "../helpers";

const get_call_module = async (path, token) => {
  const res = await fetch(`${base_url}/${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const res_data = res.json();

  return res_data;
};

const post_call_module = async (body, path, token) => {
  const res = await fetch(`${base_url}/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const res_data = res.json();

  return res_data;
};

export { post_call_module, get_call_module };
