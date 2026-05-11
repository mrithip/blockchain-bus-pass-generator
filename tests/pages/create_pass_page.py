from selenium.webdriver.common.by import By
from tests.pages.base_page import BasePage


class CreatePassPage(BasePage):
    def load(self):
        self.open('/user/create-pass')
        return self

    def set_name(self, name):
        return self.type(By.ID, 'name', name)

    def set_route(self, value):
        select = self.find(By.ID, 'route')
        for option in select.find_elements(By.TAG_NAME, 'option'):
            if option.get_attribute('value') == value:
                option.click()
                return select
        raise ValueError(f'Route option {value} not found')

    def set_aadhar(self, aadhar):
        return self.type(By.ID, 'aadhar', aadhar)

    def set_expiry_date(self, expiry_date):
        return self.type(By.ID, 'expiryDate', expiry_date)

    def submit_pass_request(self):
        button = self.find(By.XPATH, "//button[contains(., 'Create Bus Pass')]")
        button.click()
        return self

    def click_pay_with_razorpay(self):
        button = self.find(By.XPATH, "//button[contains(., 'Pay ₹100 with Razorpay') or contains(., 'Pay $100 with Razorpay')]")
        button.click()
        return self

    def get_success_message(self):
        return self.get_text(By.XPATH, "//div[contains(@class, 'bg-green-50')]//text() | //div[contains(@class, 'bg-green-50')]//p | //div[contains(@class, 'bg-green-50')]")

    def get_qr_image(self):
        return self.find(By.XPATH, "//img[contains(@src, 'data:image/png')]")

    def stub_razorpay(self):
        self.driver.execute_script(
            "window.Razorpay = function(options) { this.open = function() { setTimeout(function() { options.handler({ razorpay_order_id: 'order_test', razorpay_payment_id: 'payment_test', razorpay_signature: 'mocked_signature' }); }, 500); }; };"
        )
        return self
