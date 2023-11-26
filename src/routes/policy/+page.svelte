<script>
  import { Content } from "carbon-components-svelte";

</script>
<Content>
    <ul>
        <li>
        <p><strong>Commission Types:</strong></p>
    
        <ul>
            <li>Order Commission</li>
            <li>IPO Commission</li>
            <li>User Commission</li>
            <li>Group Commission</li>
        </ul>
        </li>
        <li>
        <p><strong>Application Priority:</strong></p>
    
        <ul>
            <li>If Order Commission is zero, apply IPO Commission.</li>
            <li>If IPO Commission is also zero, apply User Commission.</li>
            <li>If User Commission is zero, apply Group Commission (optional, applied if applicable).</li>
        </ul>
        </li>
        <li>
        <p><strong>Commission Hierarchy:</strong></p>
    
        <ul>
            <li>Order Commission takes precedence over IPO Commission.</li>
            <li>IPO Commission takes precedence over User Commission.</li>
            <li>User Commission takes precedence over Group Commission.</li>
        </ul>
        </li>
        <li>
        <p><strong>Zero Commission Handling:</strong></p>
    
        <ul>
            <li>If a specific commission type is set to zero, no commission is applied for that type.</li>
            <li>The hierarchy ensures that the first non-zero commission encountered in the order (Order &gt; IPO &gt; User &gt; Group) is applied.</li>
        </ul>
        </li>
        <li>
        <p><strong>Group Commission:</strong></p>
    
        <ul>
            <li>Group Commission is the last in the hierarchy and is optional.</li>
            <li>If set, it will be applied only if no previous commission (Order, IPO, or User) has been applied.</li>
        </ul>
        </li>
        <li>
        <p><strong>Summary:</strong></p>
    
        <ul>
            <li>The commission applied is determined by the first non-zero commission type encountered in the hierarchy (Order &gt; IPO &gt; User &gt; Group).</li>
            <li>Group Commission is optional and applied last if specified.</li>
            <li>Zero commission values result in no commission being applied for the respective type.</li>
        </ul>
        </li>
    </ul>
    
</Content>