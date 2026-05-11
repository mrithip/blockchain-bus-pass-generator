from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


class BasePage:
    def __init__(self, driver, base_url):
        self.driver = driver
        self.base_url = base_url
        self.wait = WebDriverWait(self.driver, 12)

    def open(self, path='/'):
        self.driver.get(f'{self.base_url}{path}')

    def find(self, by, value):
        return self.wait.until(EC.visibility_of_element_located((by, value)))

    def find_all(self, by, value):
        return self.driver.find_elements(by, value)

    def click(self, by, value):
        element = self.find(by, value)
        element.click()
        return element

    def type(self, by, value, text):
        element = self.find(by, value)
        element.clear()
        element.send_keys(text)
        return element

    def get_text(self, by, value):
        return self.find(by, value).text
