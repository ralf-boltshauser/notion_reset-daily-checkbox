const { Client } = require("@notionhq/client");
const fetch = require("node-fetch");
require("dotenv").config();
// TODO remove token from code, use environment variables

const TOKEN = process.env.INTEGRATION_SECRET;
const notion = new Client({
  auth: TOKEN,
});

const databaseId = process.env.DBID;
(async () => {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      and: [
        {
          property: "Duration in Days",
          formula: {
            number: {
              greater_than: 1,
            },
          },
        },
        {
          property: "Status",
          select: {
            equals: "Done",
          },
        },
        {
          property: "Todo Today",
          formula: {
            checkbox: {
              equals: true,
            },
          },
        },
      ],
    },
    sorts: [
      {
        property: "Created",
        direction: "ascending",
      },
    ],
  });

  // get pageIds
  const pageIds = response.results
    .map((page) => page.id)
    .filter((pageId) => pageId !== null);

  // loop over pages
  pageIds.forEach(async (pageId) => {
    let myProperties = response.results[0].properties;
    const options = {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Notion-Version": "2021-08-16",
        "Content-Type": "application/json",
        Authorization: "Bearer " + TOKEN,
      },
      body: JSON.stringify({
        properties: {
          Status: {
            select: {
              id: "6959c130-689e-49c3-9891-03290e5f7c70",
              name: "Todo",
              color: "pink",
            },
            type: "select",
          },
        },
      }),
    };

    // update the page
    fetch("https://api.notion.com/v1/pages/" + pageId + "", options)
      .then((response) => response.json())
      //.then((response) => console.log(response) {})
      .catch((err) => console.error(err));
  });
})();
