import DefaultLayout from "../layouts/DefaultLayout";

export default function Donate() {

    return (
        <DefaultLayout title="Donate">
            <h1 class="display-5 mb-4">Donate to Help Em3k</h1>
            <p>Edumatic 3000 (Em3k) is free, open-source software. If you want to help out, you can make a donation via PayPal:</p>
            <br/>
            <div className="text-center">
                {/* <!-- PayPal Donate Button --> */}
                <form action="https://www.paypal.com/donate" method="post" target="_blank">
                    <input type="hidden" name="campaign_id" value="FCG4VZMYZP688" />
                    <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
                    <img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1" />
                </form>
                <br/>
                {/* <!-- PayPal Donate QR Code --> */}
                <p><img src="/assets/img/donate-qr-code.png" width="128" alt="QR Code" title="Scan this code with your phone to open the donation page"/></p>
                <p className="tinytext">Scan the QR code<br/>with your phone to<br/>open the donation page</p>
            </div>
        </DefaultLayout>        
    );
}