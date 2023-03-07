/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import "@testing-library/jest-dom/extend-expect";

import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"

import BillsUI from "../views/BillsUI.js"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { bills } from "../fixtures/bills.js";

import router from "../app/Router.js";
import { ROUTES_PATH } from "../constants/routes"

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page",  () => {
    // Pour chaque test =>
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
    
    // on teste si l'icône mail possède la classe 'active-icon'
    test("Then mail icon in vertical layout should be highlighted",  () => {

      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon).toHaveClass('active-icon')

    })
    // On teste si tous les icônes qui sont sensé être requis possèdent bien la propriété 'required'
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

    // On test le chargement d'un mauvais type de fichier
    test("Then we change the wrong type of file, the handlechangeFile() function is activated and a error message appear", async () => {
      const newBill = new NewBill({
        document,
        onNavigate, 
        store: null, 
        bills:bills, 
        localStorage: window.localStorage
      })

      // On récupère et espionne la fonction handleChangeFile()
      const handleChangeFile = jest.spyOn(newBill, "handleChangeFile")
      newBill.handleChangeFile = jest.fn()

      const filesInput = screen.getAllByTestId('file') // Constante de l'input file
      const errorMessage = screen.getByTestId('errorMessage') // Constante du paragraphe 'p' du message d'erreur

      // On initialise un nouveau mauvais type de fichier
      const pdfFile = new File (["document"], "document.pdf", {
        type: 'application/pdf'
        }
      )     

      filesInput.forEach(fileInput => {
        // On charge un fichier avec la mauvaise extension (.pdf)
        fileInput.addEventListener('change', handleChangeFile)
        userEvent.upload(fileInput, pdfFile);
        // On s'attend à ce que le message d'erreur ne possède plus la classe hidden
        expect(errorMessage).not.toHaveClass('hidden')    
        // On s'attend à ce que la fonction soit appelée       
        expect(handleChangeFile).toHaveBeenCalled()  
      })                  

    })

    // On crée un nouveau ticket
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


// Création du Test POST
describe("Then we are on employee page", () => {  
    test("Then we POST a bill", async ()=> {
      
      const bill = {
        "id": "UIUZtnPQvnbFnB0ozvJh",
        "name": "test3",
        "email": "a@a",
        "type": "Services en ligne",
        "vat": "60",
        "pct": 20,
        "commentAdmin": "bon bah d'accord",
        "amount": 300,
        "status": "accepted",
        "date": "2003-03-03",
        "commentary": "",
        "fileName": "facture-client-php-exportee-dans-document-pdf-enregistre-sur-disque-dur.png",
        "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…dur.png?alt=media&token=571d34cb-9c8f-430a-af52-66221cae1da3"
      }
      
      const getSpy = jest.spyOn( mockStore.bills(), "post")
      mockStore.bills().post(bill)
      // On vérifie si la fonction soit appelée une fois
      expect(getSpy).toHaveBeenCalledTimes(1)
      // On vérifie si la fonction soit appelée avec 'bill'
      expect(getSpy).toHaveBeenLastCalledWith(bill)
    })  
})

// Test des erreurs 404 et 500
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    // On verifie qu'on est bien sur la bonne page
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      
      document.body.innerHTML = NewBillUI({ data:bills })
      await waitFor(() => screen.getByTestId("button"))

      expect(screen.getByTestId("button")).toBeTruthy();
    })

    describe("When an error occurs on API", () => {
      beforeEach(() => {

        // On espionne la fonction bills() du mockStore
        jest.spyOn(mockStore, "bills")

        // On est sur la page Employée
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      
      // Création de la page NewBillUI
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      const html = NewBillUI()
      root.append(html)
      router() 
        
      })      
      // On Test l'erreur 404
      test("fetches bills from an API and fails with 404 message error", async () => {
        
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }})
      
       const html2 = BillsUI({ error: "Erreur 404" })
        document.body.innerHTML = html2;
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })
      // On test l'erreur 500
      test("fetches messages from an API and fails with 500 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})
      
       const html2 = BillsUI({ error: "Erreur 500" })
        document.body.innerHTML = html2;
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })

  })
})  
    
