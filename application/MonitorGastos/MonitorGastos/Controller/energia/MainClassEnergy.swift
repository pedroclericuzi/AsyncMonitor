//
//  MainClassEnergy.swift
//  MonitorGastos
//
//  Created by Pedro Clericuzi on 04/06/2018.
//  Copyright © 2018 Pedro Clericuzi. All rights reserved.
//

import UIKit
import Firebase
import FirebaseDatabase

class MainClassEnergy: UIViewController {
    
    @IBOutlet weak var valorAtual: UILabel!
    @IBOutlet weak var porcentagem: UILabel!
    @IBOutlet weak var meta: UILabel!
    var ref:DatabaseReference!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        //firebaseDB.pegarDados()
        ref = Database.database().reference()
        pegarDados()
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    @IBAction func btRecarregar(_ sender: Any) {
        pegarDados()
    }
    
    func pegarDados() {
        self.ref.child("energia").child("definicoes").observe(DataEventType.value, with: { (snapshot) in
            let postDict = snapshot.value as? NSDictionary
            self.meta.text = ("\(postDict!["meta"] ?? "")")
        })
        self.ref.child("energia").child("status").observe(DataEventType.value, with: { (snapshot) in
            let postDict = snapshot.value as? NSDictionary
            
            let valor = postDict?.value(forKey: "valor") as? NSNumber
            let totalValor = valor?.floatValue
            self.valorAtual.text = ("\(String(format: "%.2f", totalValor!))")
            
            let porcent = postDict?.value(forKey: "porcentagem") as? NSNumber
            let totalPorcent = porcent?.floatValue
            self.porcentagem.text = ("\(String(format: "%.2f", totalPorcent!))%")
            
        })
    }
    
    
}
