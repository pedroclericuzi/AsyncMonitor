//
//  SettingsWater.swift
//  MonitorGastos
//
//  Created by Pedro Clericuzi on 04/06/2018.
//  Copyright © 2018 Pedro Clericuzi. All rights reserved.
//

import UIKit
import Firebase
import FirebaseDatabase

class SettingsWater: UIViewController {
    
    @IBOutlet weak var meta: UITextField!
    @IBOutlet weak var diaProxLeitura: UITextField!
    @IBOutlet weak var mesProxLeitura: UITextField!
    var ref = Database.database().reference()
    override func viewDidLoad() {
        super.viewDidLoad()
        self.ref.child("agua").child("definicoes").observe(DataEventType.value, with: { (snapshot) in
            let postDict = snapshot.value as? NSDictionary
            self.meta.text = ("\(postDict!["meta"] ?? "")")
            self.diaProxLeitura.text = ("\(postDict!["dia"] ?? "")")
            self.mesProxLeitura.text = ("\(postDict!["mes"] ?? "")")
        })
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        view.endEditing(true);
    }
    
    @IBAction func Save(_ sender: Any) {
        self.ref.child("agua/definicoes/dia").setValue(Int(diaProxLeitura.text!))
        self.ref.child("agua/definicoes/mes").setValue(Int(mesProxLeitura.text!))
        self.ref.child("agua/definicoes/meta").setValue(Int(meta.text!))
        navigationController?.popViewController(animated: true)
        dismiss(animated: true, completion: {self.presentedViewController?.viewWillAppear(true)})
    }
}
