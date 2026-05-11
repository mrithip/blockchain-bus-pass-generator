from selenium.webdriver.common.by import By
from tests.pages.base_page import BasePage


class RegisterPage(BasePage):
    def load(self):
        self.open('/register')
        return self

    def enter_name(self, name):
        return self.type(By.ID, 'name', name)

    def enter_email(self, email):
        return self.type(By.ID, 'email', email)

    def enter_password(self, password):
        return self.type(By.ID, 'password', password)

    def enter_confirm_password(self, password):
        return self.type(By.ID, 'confirmPassword', password)

    def submit(self):
        button = self.find(By.XPATH, "//button[@type='submit']")
        button.click()
        return self

    def register(self, name, email, password):
        self.load()
        self.enter_name(name)
        self.enter_email(email)
        self.enter_password(password)
        self.enter_confirm_password(password)
        self.submit()
        return self
