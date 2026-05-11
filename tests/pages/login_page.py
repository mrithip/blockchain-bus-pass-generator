from selenium.webdriver.common.by import By
from tests.pages.base_page import BasePage


class LoginPage(BasePage):
    def load(self):
        self.open('/login')
        return self

    def enter_email(self, email):
        return self.type(By.ID, 'email', email)

    def enter_password(self, password):
        return self.type(By.ID, 'password', password)

    def submit(self):
        button = self.find(By.XPATH, "//button[@type='submit']")
        button.click()
        return self

    def login(self, email, password):
        self.load()
        self.enter_email(email)
        self.enter_password(password)
        self.submit()
        return self

    def get_page_heading(self):
        return self.get_text(By.XPATH, "//h1[contains(text(), 'Login')] | //h1[contains(text(), 'Sign in')]")
