/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import "@testing-library/jest-dom/extend-expect";

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import { ROUTES_PATH } from "../constants/routes"
import { bills } from "../fixtures/bills.js";
import router from "../app/Router.js";
import { application } from "express";

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page",  () => {
    beforeEach(() => {
      // On simule la connection à la page Employée
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "employee@test.tld"
      }))
      
      // On injecte dans le HTML la page NewBillUI
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
        document,
        onNavigate, 
        store: null, 
        bills:bills, 
        localStorage: window.localStorage
      })
      const handleChangeFile = jest.spyOn(newBill, "handleChangeFile")
      newBill.handleChangeFile = jest.fn()
      const filesInput = screen.getAllByTestId('file')
      const errorMessage = screen.getByTestId('errorMessage')
      const pdfFile = new File (["document"], "document.pdf", {
        type: 'application/pdf'
        }
      )
      const jpegFile = new File (["image"], "facturefreemobile.jpg", {
        type: 'image/jpeg'
        }
      )
      // Création des données du nouveau Bill
      // const inputsValue = {
      //   type: "Transports",
      //   date: "23-01-2023",
      //   amount: "348",
      //   name: "Test jpeg",
      //   pct: '1',
      //   commentary: "Test ajout d'une fichier au format .jpg",

      //   fileName: "facturefreemobile.jpg",
      //   fileUrl:"../assets/images/facturefreemobile.jpg",
      // }
      
      // On charge les données des les entrées du formulaire
      // userEvent.type(screen.getAllByTestId('expense-type'), inputsValue.type)
      // userEvent.type(screen.getAllByTestId('expense-name'), inputsValue.name)
      // userEvent.type(screen.getAllByTestId('datepicker'), inputsValue.date)
      // userEvent.type(screen.getAllByTestId('amount'), inputsValue.amount)
      // userEvent.type(screen.getAllByTestId('pct'), inputsValue.pct) 
      // userEvent.type(screen.getAllByTestId('commentary'), inputsValue.commentary)   

      // screen.getAllByTestId('expense-type').value = inputsValue.type;
      // screen.getAllByTestId('expense-name').value = inputsValue.name;
      // screen.getAllByTestId('datepicker').value = inputsValue.date;
      // screen.getAllByTestId('amount').value = inputsValue.amount;
      // screen.getAllByTestId('pct').value = inputsValue.pct;      
      // screen.getAllByTestId('commentary').value = inputsValue.commentary; 
      
      // newBill.fileName = inputsValue.fileName
      // newBill.fileUrl = inputsValue.fileUrl
      // newBill.billId = "123456"

      filesInput.forEach(fileInput => {
        // On charge un fichier avec la mauvaise extension (.pdf)
        fileInput.addEventListener('change', handleChangeFile)
        userEvent.upload(fileInput, pdfFile);
        expect(errorMessage).not.toHaveClass('hidden')           
        expect(handleChangeFile).toHaveBeenCalled()  
        // Puis on charge a nouveau un fichier mais cette fois-ci au bon format (.jpeg)
        fileInput.addEventListener('change', handleChangeFile)
        userEvent.upload(fileInput, jpegFile);
        expect(errorMessage).toHaveClass('hidden')           
        expect(handleChangeFile).toHaveBeenCalled()  
      })      
          

    })

    test('Then on submit we create a new Bill', () => {
      // On crée la page de la facture
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        bills:bills,
        localStorage: window.localStorage
      })
      // Création des données du nouveau Bill
      const inputsValue = {
        type: "Transports",
        date: "23-01-2023",
        amount: "348",
        name: "Test jpeg",
        pct: 1,
        commentary: "Test ajout d'une fichier au format .jpg",

        fileName: "facturefreemobile.jpg",
        fileUrl:"../assets/images/facturefreemobile.jpg",
      }
      
      // On charge les données des les entrées du formulaire
      screen.getAllByTestId('expense-type').value = inputsValue.type;
      screen.getAllByTestId('expense-name').value = inputsValue.name;
      screen.getAllByTestId('datepicker').value = inputsValue.date;
      screen.getAllByTestId('amount').value = inputsValue.amount;
      screen.getAllByTestId('pct').value = inputsValue.pct;      
      screen.getAllByTestId('commentary').value = inputsValue.commentary;     
      
      newBill.fileName = inputsValue.fileName
      newBill.fileUrl = inputsValue.fileUrl

      // On simule les fonctions updateBill et handleSubmit
      newBill.updateBill = jest.fn();
      const handleSubmit=jest.fn((e) => newBill.handleSubmit(e))
      
      //On simule l'évènement de l'utilisateur au click
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("click", handleSubmit);
      userEvent.click(form)

      // On vérifie si les deux fonctions sont appelée
      expect(handleSubmit).toHaveBeenCalled()
      expect(newBill.updateBill).toHaveBeenCalled()
      
    })
  })
})

// describe("Given I am a user connected as Employee", () => {
//   describe("When I navigate to Bills", () => {
//     test("fetches bills from mock API GET", async () => {
//       localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
//       const root = document.createElement("div")
//       root.setAttribute("id", "root")
//       document.body.append(root)
//       router()
      
//       document.body.innerHTML = NewBillUI({ data:bills })
//       await waitFor(() => screen.getByTestId("button"))

//       expect(screen.getByTestId("button")).toBeTruthy();
//     })

//     describe("When an error occurs on API", () => {
//       beforeEach(() => {

//         // On espionne la fonction bills() du mockStore
//         jest.spyOn(mockStore, "bills")

//         // On est sur la page Employée
//         Object.defineProperty(window, 'localStorage', { value: localStorageMock })
//         window.localStorage.setItem('user', JSON.stringify({
//         type: 'Employee'
//       }))
      
//       // Création de la page NewBillUI
//       const root = document.createElement("div")
//       root.setAttribute("id", "root")
//       document.body.append(root)
//       const html = NewBillUI()
//       root.append(html)
//       router() 
        
//       })      
//       test("fetches bills from an API and fails with 404 message error", async () => {
        
//         mockStore.bills.mockImplementationOnce(() => {
//           return {
//             create : () =>  {
//               return Promise.reject(new Error("Erreur 404"))
//             }
//           }})
//         // window.onNavigate(ROUTES_PATH.NewBill)
//         await new Promise(process.nextTick);
//         const message = await screen.getByText(/Erreur 404/)
//         expect(message).toBeTruthy()
//       })

//       test.skip("fetches messages from an API and fails with 500 message error", async () => {

//         const mockedBill = jest
//           .spyOn(mockStore, "bills")
//           .mockImplementationOnce(() => {
//             return {
//               create: jest.fn().mockRejectedValue(new Error("Erreur 500")),
//             };
//           });

//         await expect(mockedBill().create).rejects.toThrow("Erreur 404");

//         expect(mockedBill).toHaveBeenCalledTimes(1);
//       })
//     })

//   })
// })  
    
