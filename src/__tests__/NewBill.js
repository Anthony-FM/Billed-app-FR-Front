/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import "@testing-library/jest-dom/extend-expect";

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import Bills from "../containers/Bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { bills } from "../fixtures/bills.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page",  () => {
    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      // document.body.innerHTML = html
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      const html = NewBillUI()
      root.append(html)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      
    })
    
    test("Then mail icon in vertical layout should be highlighted",  () => {

      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon).toHaveClass('active-icon')

    })
    test('Then All required input are required', () => {
      let expenseType = screen.getAllByTestId('expense-type')
      expect(expenseType[0]).toHaveAttribute(`required`)
      let datePicker = screen.getAllByTestId('datepicker')
      expect(datePicker[0]).toHaveAttribute(`required`)
      let amount = screen.getAllByTestId('amount')
      expect(amount[0]).toHaveAttribute(`required`)
      let pct = screen.getAllByTestId('pct')
      expect(pct[0]).toHaveAttribute(`required`)
      let file = screen.getAllByTestId('file')
      expect(file[0]).toHaveAttribute(`required`)
    })    

    test("Then we change the file, the handlechangeFile() function is activated", async () => {
      const newBill = new NewBill({
        document, onNavigate, store: null, bills:bills, localStorage: window.localStorage
      })
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      const fileInput = screen.getAllByTestId('file')
      
      const inputsValue = {
        amount: 348,
        commentAdmin: "",
        commentary: "Test ajout d'une fichier au format .jpg",
        date: "23-01-2023",
        email: "employee@test.tld",
        fileName: "facturefreemobile.jpg",
        fileUrl:"http://localhost:5678/public\\e4088bc35fe9c1b202c346fd5829a131",
        file: new File(["img"], "facturefreemobile.jpg", { type: "image/png" }),
        id: "wf6A7GfhaCJcyAYUVqWS73",
        name: "Test jpeg",
        pct: 1,
        status: "pending",
        type: "Transports",
        vat: ""

      }
      
      let expenseType = screen.getAllByTestId('expense-type')
      let datePicker = screen.getAllByTestId('datepicker')
      let amount = screen.getAllByTestId('amount')
      let pct = screen.getAllByTestId('pct')

      expenseType.value = inputsValue.name;      
      amount.value = inputsValue.amount;
      datePicker.value = inputsValue.date;
      pct.value = inputsValue.pct;   

      console.log(bills)
      fileInput[0].addEventListener('change', handleChangeFile)
      userEvent.upload(fileInput[0], inputsValue.fileName)
      
      expect(handleChangeFile).toHaveBeenCalled()
      // expect(fileInput[0].files[0]).toHaveLength(1)
      

    })

    test('Then on submit we create a new Bill', () => {
      
      const newBill = new NewBill({
        document, onNavigate, store: null, bills:bills, localStorage: window.localStorage
      })
      
      let expenseType = screen.getAllByTestId('expense-type')
      let datePicker = screen.getAllByTestId('datepicker')
      let amount = screen.getAllByTestId('amount')
      let pct = screen.getAllByTestId('pct')
      let file = screen.getAllByTestId('file')

      const InputsValue = {
        amount: "348",
        commentAdmin: "",
        commentary: "Test ajout d'une fichier au format .jpg",
        date: "23-01-2023",
        email: "employee@test.tld",
        fileName: "facturefreemobile.jpg",
        fileUrl:"http://localhost:5678/public\\e4088bc35fe9c1b202c346fd5829a131",
        file: new File(["img"], "facturefreemobile.jpg", { type: "image/png" }),
        id: "wf6A7GfhaCJcyAYUVqWS73",
        name: "Test jpeg",
        pct: 1,
        status: "pending",
        type: "Transports",
        vat: ""

      }

      expenseType.value = InputsValue.name;      
      amount.value = InputsValue.amount;
      datePicker.value = InputsValue.date;
      pct.value = InputsValue.pct;    

      const fileInput = screen.getAllByTestId('file')
      fileInput.value = InputsValue.fileName;
      
      const handleSubmit=jest.fn((e) => newBill.handleSubmit(e))
      
      userEvent.upload(fileInput[0], InputsValue.fileName)

      // const button = screen.getAllByTestId('button')
      // button[0].addEventListener('click', handleSubmit)      

      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("click", handleSubmit);
      userEvent.click(form)

      expect(handleSubmit).toHaveBeenCalled()
      // if (expenseType && datePicker && amount && pct && file){
      // } else {
      //   const errorMessage = screen.getByTestId('errorMessage')
      //   expect(errorMessage[0]).not.toHaveClass('hidden')
      // }
    })
  })
})
