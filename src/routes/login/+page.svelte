<script>
  //@ts-nocheck
  import {
    Grid,
    Column,
    Content,
    FluidForm,
    PasswordInput,
    Row,
    TextInput,
    Tile,
    Form,
    FormGroup,
    Button,
    InlineNotification,
  } from "carbon-components-svelte";
  import { token } from "../../helper/token_store";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { PUBLIC_API_URI } from "$env/static/public";
  import { authenticate } from "../../helper/utils";

  let token_;
  let username = "";
  let password = "";
  let status = 0;
  //   let invalid = false;

  //   $: invalid = !/^(?=.*[a-z])(?=.*[A-Z])(?=.*d)[a-zA-Zd]{6,}$/.test(password);

  token.subscribe((value) => {
    token_ = value;
  });

  const loginUser = async () => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      username: username,
      password: password,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    const response = await fetch(`${PUBLIC_API_URI}/login`, requestOptions);
    const data = await response.json();

    if (data["status"] === 200) {
      status = 200;
      token.set(data["data"]["token"]);
      localStorage.setItem("token", data["data"]["token"]);
      goto(`/`, { replaceState: true });
    } else {
      status = 400;
    }
  };

  onMount(async () => {
    await token;

    if (token_) {
      const authenticated = await authenticate(token_);
      if (!authenticated) {
        goto(`/logout`, { replaceState: true });
        return;
      }

      goto("/", { replaceState: true });
      return;
    }
  });
</script>

<Content>
  <Grid>
    <Row style="justify-content: center">
      <Column lg={6}>
        <Tile>
          <h3 class="text--heading">Login</h3>
          <Form
            on:submit={async (e) => {
              e.preventDefault();
              await loginUser();
            }}
          >
            <FormGroup>
              <TextInput
                bind:value={username}
                labelText="Email"
                placeholder="Enter email..."
                required
              />
            </FormGroup>
            <FormGroup>
              <PasswordInput
                bind:value={password}
                required
                type="password"
                labelText="Password"
                placeholder="Enter password..."
              />
            </FormGroup>
            {#if status === 400}
              <FormGroup>
                <InlineNotification
                  kind="error"
                  title="Error:"
                  subtitle="Invalid Credentials"
                />
              </FormGroup>
            {/if}
            {#if status === 200}
              <FormGroup>
                <InlineNotification
                  kind="success"
                  title="Success:"
                  subtitle="Successful Login!"
                />
              </FormGroup>
            {/if}
            <Button type="submit">Login</Button>
          </Form>
        </Tile>
      </Column>
    </Row>
  </Grid>
</Content>

<style lang="scss">
  .text--heading {
    margin-bottom: 1.25rem;
  }
</style>
