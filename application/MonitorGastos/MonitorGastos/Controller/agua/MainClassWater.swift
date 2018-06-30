//
//  MainClassWater.swift
//  MonitorGastos
//
//  Created by Pedro Clericuzi on 04/06/2018.
//  Copyright © 2018 Pedro Clericuzi. All rights reserved.
//

import UIKit
import Firebase
import FirebaseDatabase

class MainClassWater: UIViewController {
    
    @IBOutlet weak var litro: UILabel!
    @IBOutlet weak var valor: UILabel!
    @IBOutlet weak var meta: UILabel!
    
    @IBOutlet weak var conumo: UILabel!
    @IBOutlet weak var tarEsgoto: UILabel!
    @IBOutlet weak var totalConsumo: UILabel!
    var ref:DatabaseReference!
    override func viewDidLoad() {
        super.viewDidLoad()
        ref = Database.database().reference()
        pegarDados()
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    func pegarDados() {
        self.ref.child("agua").child("definicoes").observe(DataEventType.value, with: { (snapshot) in
            let postDict = snapshot.value as? NSDictionary
            self.meta.text = ("\(postDict!["meta"] ?? "")")
        })
        self.ref.child("agua").child("status").observe(DataEventType.value, with: { (snapshot) in
            let postDict = snapshot.value as? NSDictionary
            
            let valor = postDict?.value(forKey: "valor") as? NSNumber
            let totalValor = valor?.floatValue
            self.valor.text = ("\(String(format: "%.2f", totalValor!))")
            self.tarEsgoto.text = ("\(String(format: "%.2f", totalValor!))")
            self.conumo.text = ("\(String(format: "%.2f", totalValor!))")
            self.totalConsumo.text = ("\(String(format: "%.2f", totalValor!*2))")
            
            let porcent = postDict?.value(forKey: "litros") as? NSNumber
            let totalPorcent = porcent?.floatValue
            self.litro.text = ("\(String(format: "%.2f", totalPorcent!)) L")
            
            self.tarEsgoto.text = ("\(String(format: "%.2f", totalValor!))")
            
        })
    }

}
