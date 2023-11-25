//@ts-nocheck
import { PUBLIC_API_URI } from "$env/static/public";

export const formatCurrency = (number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(number);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

export const formatPercentage = (percentage) => {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2, // Adjust as needed
    maximumFractionDigits: 2, // Adjust as needed
  }).format(percentage);
};

export const authenticate = async (token) => {
  const authenticateToken = async (token_) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token_}`);

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    const response = await fetch(
      `${PUBLIC_API_URI}/authenticate`,
      requestOptions
    );

    const data = response.json();
    return data;
  };

  const response = await authenticateToken(token);
  if (
    response &&
    response.hasOwnProperty("status") &&
    response["status"] === 200
  ) {
    return true;
  }

  return false;
};
