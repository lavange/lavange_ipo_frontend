<script>
  //@ts-nocheck
  import {
    Column,
    Content,
    Grid,
    ImageLoader,
    Loading,
    Row,
    TextInput,
    Tile,
    Truncate,
  } from "carbon-components-svelte";
  import { onMount } from "svelte";
  import { debounce } from "lodash";

  let ipos = null;
  let loading = true;

  const fetchIPO = async () => {
    loading = true;
    var myHeaders = new Headers();
    myHeaders.append("authority", "service.upstox.com");
    myHeaders.append("accept", "*/*");
    myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7");
    myHeaders.append("accept-version", "v2.1");
    myHeaders.append("content-type", "application/json");
    myHeaders.append(
      "cookie",
      "_gcl_au=1.1.760009509.1690001477; _ga=GA1.1.1252764993.1690001478; _fbp=fb.1.1690001477772.848309186; WZRK_G=061e435f3f444b5f8c1f34ab3dd67957; _iidt=of7vkl2LmIb1Vu/rZgPJL/DXhofEdurp8faMSKY8Uxtxijlginy6iOE69luDtw6QEK5/ZHadzemVbw==; _vid_t=eTongKu8qsrAtbUB0bqoY3UqegxF0W5dMXl8mrRWFKbFuyfTuCYZxdhptv40ck2q+Ur5IIA7IYNxPA==; _uetvid=dba0ed400da011eeaba69d0f39d1c4b7; _ga_VFG6NNXYGT=GS1.1.1692786197.2.0.1692786199.0.0.0; _clck=x3md3w|2|fee|0|1330; utm_referer=https%3A%2F%2Fupstox.com%2Flearning-center%2Fipo%2Fipo-calendar-india-year-2022-2023%2F; _ga_NT8SZ3CWSL=GS1.1.1696324323.3.0.1696324331.0.0.0; _ga_CLCPGTZJXV=GS1.1.1696324323.9.0.1696324331.52.0.0; __cf_bm=dwhAT6O3TTgUl9mMDyIr6.lHUE6ofVwCg4GtkVLL38U-1697775674-0-AeSkXiv+ArXsb3qx8lw7pf7dt3M0IFEoGevt/DT3jgX0tJHhm47cjiwPMlIeDn9vGVjHBTMNQ/H7blcZ839rnes=; _cfuvid=zD0rBEeXEJIP1mNhRAo5vX0W._NZUKxwKucpR1QB4Qw-1697775674246-0-604800000; __cfruid=46bf94206095e5e619984cd468c43f6c78700593-1697775675; mp_62597aa51842e6e2c56b97d96e4c5f8a_mixpanel=%7B%22distinct_id%22%3A%20%2230451113%22%2C%22%24device_id%22%3A%20%221897bf04ecf1da-0ff463979836af-26031d51-144000-1897bf04ecf1da%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fupstox.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22upstox.com%22%2C%22__mps%22%3A%20%7B%7D%2C%22__mpso%22%3A%20%7B%7D%2C%22__mpus%22%3A%20%7B%7D%2C%22__mpa%22%3A%20%7B%7D%2C%22__mpu%22%3A%20%7B%7D%2C%22__mpr%22%3A%20%5B%5D%2C%22__mpap%22%3A%20%5B%5D%2C%22%24user_id%22%3A%20%2230451113%22%2C%22Platform%22%3A%20%22Web%203.0%22%2C%22%24search_engine%22%3A%20%22google%22%7D; __cf_bm=ix.zUqENxnyUUhdxvKlsn1mNzjVlCgFe_On.ATDeTdI-1698596850-0-AaX23+/SKUwtyC0jTNj4TdcTiaSXNO3+7wDiAws+P6DnSn8kgdBcDuJls6+Id/RjrBvhcb84LRYxtesTP2G8nPQ=; __cfruid=47d6e6e3989313e1f181f14a1a77f771ebb46260-1698596850; _cfuvid=vmIDb6er7qhPSPoCrSLVX9vwCWgSILZSTX0JQQMgxZU-1698596850506-0-604800000"
    );
    myHeaders.append("origin", "https://invest.upstox.com");
    myHeaders.append("referer", "https://invest.upstox.com/");
    myHeaders.append(
      "sec-ch-ua",
      '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"'
    );
    myHeaders.append("sec-ch-ua-mobile", "?0");
    myHeaders.append("sec-ch-ua-platform", '"Windows"');
    myHeaders.append("sec-fetch-dest", "empty");
    myHeaders.append("sec-fetch-mode", "cors");
    myHeaders.append("sec-fetch-site", "same-site");
    myHeaders.append(
      "user-agent",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
    );
    myHeaders.append(
      "x-device-details",
      "platform=WEB|osName=Windows/NT 10.0|osVersion=Chrome/118.0.0.0|appVersion=1|modelName=Chrome|manufacturer=unknown"
    );
    myHeaders.append(
      "x-request-id",
      "NIPO-f0f8f52f-39e4-49e3-876c-f1503619d75a"
    );

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    const response = await fetch(
      "https://service.upstox.com/ipo/open/v2/ipos?status=active%2Cupcoming%2CpreApply%2Cclosed&investorTypes=true&displayText=true&details=true&acceptVersion=v2.1",
      requestOptions
    );

    const data = response.json();
    loading = false;
    return data;
  };

  onMount(async () => {
    const data = await fetchIPO();
    ipos = data["data"]["ipos"] ?? [];
  });

  let search_query = "";

  const filter = (val) => {
    let filtered_data = val;

    if (search_query !== "") {
      filtered_data = filtered_data.filter((ipo) =>
        ipo["name"].toLowerCase().includes(search_query.toLowerCase())
      );
    }
    return filtered_data;
  };

  //const debouncedFilter = debounce(filter, 250);

  // Use the debounced filter function in the UI.
  const filteredIpos = filter(ipos);
</script>

<Content>
  {#if ipos === null && loading === false}
    Nothing to show!
  {:else if loading === true}
    <Loading />
  {:else}
    <Grid padding fullWidth>
      <Row>
        <Column>
          <TextInput bind:value={search_query} placeholder="Enter ipo name" />
        </Column>
      </Row>
      <Row>
        {#each filteredIpos as ipo}
          <Column sm={3} md={3} lg={4}>
            <Tile light
              ><h3><Truncate>{ipo["name"]}</Truncate></h3>
              <ImageLoader src={ipo["logoUrl"]} />
            </Tile>
          </Column>
        {/each}
      </Row>
    </Grid>
  {/if}
</Content>
