const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Property = require("./models/Property");
const User = require("./models/User");

dotenv.config();
connectDB();

const importData = async () => {
  try {
    const seller = await User.findOne({ role: "seller" });

    if (!seller) {
      console.log("❌ No seller found. Create a seller first.");
      process.exit();
    }

    await Property.deleteMany();

    const imageUrls = {
      Villa: [
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771390020/laxuary_villa_h61moe.avif",
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395223/villa7_yot2sb.avif",
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395224/villa6_he8f9l.avif",
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395226/villa5_wkzsuj.avif",
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395227/villa4_c1ga66.avif",
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395236/villa3_jerwly.avif",
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395237/villa2_rqvlbw.avif",
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395248/villa8_xuoijf.avif",
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395717/villa9_syqii2.avif",
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395914/download_7_k1fnve.jpg",
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771908501/download_b5us6w.jpg",
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771908492/Nh%C3%A0_%C4%91%E1%BA%B9p_I_Vo_Huu_Linh_Architects_qcnsoc.jpg"
      ],
      Home: [
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771390481/home_itr3dv.webp",
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395030/home4_swkw5h.avif",
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395029/7_ptippg.avif",
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395029/home6_wqk84x.avif",
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395029/home5_yjl7ip.avif",
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395031/home3_dn6gvo.avif",
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395032/home2_rpdy2m.avif",
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395899/Engineering_Information_added_a_._ogmnhi.jpg",
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395800/home8_zkqvpq.avif",
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771908477/download_1_v3h0jo.jpg",
      ],
      Farmhouse: [
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771390522/premium_photo-1733760125610-3b5ebc834623_mqqwlg.avif",
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771394603/farmhouse5_od18tv.avif",
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771394603/farmhouse6_pcgdqk.webp",
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771394604/farmhouse4_okfmij.avif",
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771394604/farmhouse3_aet8ai.avif",
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771394623/farmhouse2_uxb5ck.avif",
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771394630/mick-kirchman-iF5djn_VUZY-unsplash_tvoeyb.jpg",
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771908457/farmhouse7_dylgbh.avif",
        "https://res.cloudinary.com/df5c7yrgx/image/upload/v1771908456/farmhouse8_zj7yha.webp"
      ]
    };

    const roomImageUrls = {
      Villa: [
        {
          exterior: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1771390020/laxuary_villa_h61moe.avif"],
          bedroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513304/BR_1_ddpivc.avif"],
          bathroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513274/Bath_1_quji1f.jpg"],
          livingRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513243/LR_2_kl653e.jpg"],
          diningRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513200/DR_3_z78c0g.jpg"],
          kitchen: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513438/KT_1_pk6dak.avif"]
        },
        {
          exterior: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395223/villa7_yot2sb.avif"],
          bedroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513303/BR_2_ovsjjj.png"],
          bathroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513273/Bath_2_fzqlpg.jpg"],
          livingRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513243/LR_5_qvw52j.webp"],
          diningRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513200/DR2_mtgeca.jpg"],
          kitchen: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513437/KT_5_w48tee.avif"]
        },
        {
          exterior: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395237/villa2_rqvlbw.avif"],
          bedroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513302/BR_3_pthttt.webp"],
          bathroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513273/Bath_3_j3ae9f.png"],
          livingRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513243/LR_3_ngyhg7.jpg"],
          diningRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513199/DR_1_upe9y7.webp"],
          kitchen: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513437/KT_3_rnakob.jpg"]
        },
        {
          exterior: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395224/villa6_he8f9l.avif"],
          bedroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513302/BR_4_y9zmqi.webp"],
          bathroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513272/Bath_4_fr8aon.jpg"],
          livingRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513242/LR1_ofs0nx.webp"],
          diningRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513199/DR4_tsgomo.jpg"],
          kitchen: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513436/KT_4_vjzsoy.jpg"]
        },
        {
          exterior: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395226/villa5_wkzsuj.avif"],
          bedroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513301/BR_5_nabjst.jpg"],
          bathroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513272/Bath_5_bwocaa.jpg"],
          livingRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513242/LR_4_cwhf1z.jpg"],
          diningRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513199/DR_5_fhuvij.jpg"],
          kitchen: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513437/KT_2_mcfojm.jpg"]
        },
        {
          exterior: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395227/villa4_c1ga66.avif"],
          bedroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513304/BR_1_ddpivc.avif"],
          bathroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513274/Bath_1_quji1f.jpg"],
          livingRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513243/LR_2_kl653e.jpg"],
          diningRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513200/DR_3_z78c0g.jpg"],
          kitchen: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513438/KT_1_pk6dak.avif"]
        },
        {
          exterior: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395236/villa3_jerwly.avif"],
          bedroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513303/BR_2_ovsjjj.png"],
          bathroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513273/Bath_2_fzqlpg.jpg"],
          livingRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513243/LR_5_qvw52j.webp"],
          diningRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513200/DR2_mtgeca.jpg"],
          kitchen: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513437/KT_5_w48tee.avif"]
        },
        {
          exterior: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395248/villa8_xuoijf.avif"],
          bedroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513302/BR_3_pthttt.webp"],
          bathroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513273/Bath_3_j3ae9f.png"],
          livingRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513243/LR_3_ngyhg7.jpg"],
          diningRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513199/DR_1_upe9y7.webp"],
          kitchen: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513437/KT_3_rnakob.jpg"]
        },
        {
          exterior: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395717/villa9_syqii2.avif"],
          bedroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513302/BR_4_y9zmqi.webp"],
          bathroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513272/Bath_4_fr8aon.jpg"],
          livingRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513242/LR1_ofs0nx.webp"],
          diningRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513199/DR4_tsgomo.jpg"],
          kitchen: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513436/KT_4_vjzsoy.jpg"]
        }
      ],
      Home: [
        {
          exterior: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1771390481/home_itr3dv.webp"],
          bedroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513302/BR_4_y9zmqi.webp"],
          bathroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513272/Bath_4_fr8aon.jpg"],
          livingRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513242/LR1_ofs0nx.webp"],
          diningRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513199/DR4_tsgomo.jpg"],
          kitchen: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513436/KT_4_vjzsoy.jpg"]
        },
        {
          exterior: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395030/home4_swkw5h.avif"],
          bedroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513301/BR_5_nabjst.jpg"],
          bathroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513272/Bath_5_bwocaa.jpg"],
          livingRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513242/LR_4_cwhf1z.jpg"],
          diningRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513199/DR_5_fhuvij.jpg"],
          kitchen: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513437/KT_2_mcfojm.jpg"]
        },
        {
          exterior: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395029/7_ptippg.avif"],
          bedroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513304/BR_1_ddpivc.avif"],
          bathroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513274/Bath_1_quji1f.jpg"],
          livingRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513243/LR_2_kl653e.jpg"],
          diningRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513200/DR_3_z78c0g.jpg"],
          kitchen: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513438/KT_1_pk6dak.avif"]
        },
        {
          exterior: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395029/home6_wqk84x.avif"],
          bedroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513303/BR_2_ovsjjj.png"],
          bathroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513273/Bath_2_fzqlpg.jpg"],
          livingRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513243/LR_5_qvw52j.webp"],
          diningRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513200/DR2_mtgeca.jpg"],
          kitchen: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513437/KT_5_w48tee.avif"]
        },
        {
          exterior: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395029/home5_yjl7ip.avif"],
          bedroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513302/BR_3_pthttt.webp"],
          bathroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513273/Bath_3_j3ae9f.png"],
          livingRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513243/LR_3_ngyhg7.jpg"],
          diningRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513199/DR_1_upe9y7.webp"],
          kitchen: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513437/KT_3_rnakob.jpg"]
        },
        {
          exterior: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395031/home3_dn6gvo.avif"],
          bedroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513302/BR_4_y9zmqi.webp"],
          bathroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513272/Bath_4_fr8aon.jpg"],
          livingRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513242/LR1_ofs0nx.webp"],
          diningRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513199/DR4_tsgomo.jpg"],
          kitchen: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513436/KT_4_vjzsoy.jpg"]
        },
        {
          exterior: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395032/home2_rpdy2m.avif"],
          bedroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513301/BR_5_nabjst.jpg"],
          bathroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513272/Bath_5_bwocaa.jpg"],
          livingRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513242/LR_4_cwhf1z.jpg"],
          diningRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513199/DR_5_fhuvij.jpg"],
          kitchen: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513437/KT_2_mcfojm.jpg"]
        },
        {
          exterior: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395899/Engineering_Information_added_a_._ogmnhi.jpg"],
          bedroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513304/BR_1_ddpivc.avif"],
          bathroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513274/Bath_1_quji1f.jpg"],
          livingRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513243/LR_2_kl653e.jpg"],
          diningRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513200/DR_3_z78c0g.jpg"],
          kitchen: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513438/KT_1_pk6dak.avif"]
        },
        {
          exterior: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1771395800/home8_zkqvpq.avif"],
          bedroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513303/BR_2_ovsjjj.png"],
          bathroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513273/Bath_2_fzqlpg.jpg"],
          livingRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513243/LR_5_qvw52j.webp"],
          diningRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513200/DR2_mtgeca.jpg"],
          kitchen: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513437/KT_5_w48tee.avif"]
        }
      ],
      Farmhouse: [
        {
          exterior: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1771390522/premium_photo-1733760125610-3b5ebc834623_mqqwlg.avif"],
          bedroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513303/BR_2_ovsjjj.png"],
          bathroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513273/Bath_2_fzqlpg.jpg"],
          livingRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513243/LR_5_qvw52j.webp"],
          diningRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513200/DR2_mtgeca.jpg"],
          kitchen: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513437/KT_5_w48tee.avif"]
        },
        {
          exterior: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1771394603/farmhouse5_od18tv.avif"],
          bedroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513302/BR_3_pthttt.webp"],
          bathroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513273/Bath_3_j3ae9f.png"],
          livingRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513243/LR_3_ngyhg7.jpg"],
          diningRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513199/DR_1_upe9y7.webp"],
          kitchen: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513437/KT_3_rnakob.jpg"]
        },
        {
          exterior: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1771394603/farmhouse6_pcgdqk.webp"],
          bedroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513302/BR_4_y9zmqi.webp"],
          bathroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513272/Bath_4_fr8aon.jpg"],
          livingRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513242/LR1_ofs0nx.webp"],
          diningRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513199/DR4_tsgomo.jpg"],
          kitchen: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513436/KT_4_vjzsoy.jpg"]
        },
        {
          exterior: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1771394604/farmhouse4_okfmij.avif"],
          bedroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513301/BR_5_nabjst.jpg"],
          bathroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513272/Bath_5_bwocaa.jpg"],
          livingRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513242/LR_4_cwhf1z.jpg"],
          diningRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513199/DR_5_fhuvij.jpg"],
          kitchen: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513437/KT_2_mcfojm.jpg"]
        },
        {
          exterior: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1771394604/farmhouse3_aet8ai.avif"],
          bedroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513304/BR_1_ddpivc.avif"],
          bathroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513274/Bath_1_quji1f.jpg"],
          livingRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513243/LR_2_kl653e.jpg"],
          diningRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513200/DR_3_z78c0g.jpg"],
          kitchen: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513438/KT_1_pk6dak.avif"]
        },
        {
          exterior: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1771394623/farmhouse2_uxb5ck.avif"],
          bedroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513303/BR_2_ovsjjj.png"],
          bathroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513273/Bath_2_fzqlpg.jpg"],
          livingRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513243/LR_5_qvw52j.webp"],
          diningRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513200/DR2_mtgeca.jpg"],
          kitchen: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513437/KT_5_w48tee.avif"]
        },
        {
          exterior: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1771394630/mick-kirchman-iF5djn_VUZY-unsplash_tvoeyb.jpg"],
          bedroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513302/BR_3_pthttt.webp"],
          bathroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513273/Bath_3_j3ae9f.png"],
          livingRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513243/LR_3_ngyhg7.jpg"],
          diningRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513199/DR_1_upe9y7.webp"],
          kitchen: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513437/KT_3_rnakob.jpg"]
        },
        {
          exterior: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1771908457/farmhouse7_dylgbh.avif"],
          bedroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513302/BR_4_y9zmqi.webp"],
          bathroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513272/Bath_4_fr8aon.jpg"],
          livingRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513242/LR1_ofs0nx.webp"],
          diningRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513199/DR4_tsgomo.jpg"],
          kitchen: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513436/KT_4_vjzsoy.jpg"]
        },
        {
          exterior: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1771908456/farmhouse8_zj7yha.webp"],
          bedroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513301/BR_5_nabjst.jpg"],
          bathroom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513272/Bath_5_bwocaa.jpg"],
          livingRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513242/LR_4_cwhf1z.jpg"],
          diningRoom: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513199/DR_5_fhuvij.jpg"],
          kitchen: ["https://res.cloudinary.com/df5c7yrgx/image/upload/v1772513437/KT_2_mcfojm.jpg"]
        }
      ]
    };

    const sellerId = seller._id.toString();

    const properties = [
      {
        title: "Luxury Sea View Villa",
        description: "Sea facing villa with private pool and stunning ocean views. Perfect for luxury living with modern amenities and spacious interiors.",
        price: 25000000,
        location: "Goa",
        type: "Villa",
        status: "available",
        bedrooms: 5,
        bathrooms: 4,
        area: 3500,
        floor: 1,
        totalFloors: 2,
        furnished: "Furnished",
        yearBuilt: 2010,
        parking: 2,
        features: ["Swimming Pool", "Garden", "Sea View", "Private Pool", "Jacuzzi", "Home Theater"],
        seller: sellerId,
        images: [
          imageUrls.Villa[0],
          imageUrls.Villa[1],
          imageUrls.Villa[2]
        ],
        roomImages: roomImageUrls.Villa[0]
      },
      {
        title: "Modern Hilltop Villa",
        description: "Premium villa with panoramic hill view. Features modern architecture, private garden, and luxurious interiors.",
        price: 9800000,
        location: "Shimla",
        type: "Villa",
        status: "available",
        bedrooms: 4,
        bathrooms: 3,
        area: 2800,
        floor: 2,
        totalFloors: 2,
        furnished: "Furnished",
        yearBuilt: 2021,
        parking: 2,
        features: ["Mountain View", "Fireplace", "Deck", "Garden", "Modern Kitchen"],
        seller: sellerId,
        images: [
          imageUrls.Villa[3],
          imageUrls.Villa[4],
          imageUrls.Villa[5]
        ],
        roomImages: roomImageUrls.Villa[1]
      },
      {
        title: "Smart Home Villa",
        description: "Fully automated smart home system installed. Features home automation, security system, and modern amenities.",
        price: 8700000,
        location: "Kochi",
        type: "Villa",
        status: "available",
        bedrooms: 4,
        bathrooms: 3,
        area: 2600,
        floor: 1,
        totalFloors: 2,
        furnished: "Furnished",
        yearBuilt: 2023,
        parking: 2,
        features: ["Smart Home", "Home Theater", "Garden", "Security System", "Automated Lighting"],
        seller: sellerId,
        images: [
          imageUrls.Villa[6],
          imageUrls.Villa[7],
          imageUrls.Villa[8]
        ],
        roomImages: roomImageUrls.Villa[2]
      },
      // Home properties
      {
        title: "Family Home",
        description: "Beautiful independent family home with garden and parking. Perfect for families looking for comfort and space.",
        price: 5000000,
        location: "Chennai",
        type: "Home",
        status: "available",
        bedrooms: 3,
        bathrooms: 2,
        area: 1800,
        floor: 1,
        totalFloors: 2,
        furnished: "Semi-Furnished",
        yearBuilt: 2019,
        parking: 1,
        features: ["Garden", "Parking", "Modular Kitchen", "Children's Play Area"],
        seller: sellerId,
        images: [
          imageUrls.Home[0],
          imageUrls.Home[1],
          imageUrls.Home[2]
        ],
        roomImages: roomImageUrls.Home[0]
      },
      {
        title: "Suburban Home",
        description: "Calm suburban home perfect for families. Located in a peaceful neighborhood with community park access.",
        price: 2900000,
        location: "Indore",
        type: "Home",
        status: "available",
        bedrooms: 3,
        bathrooms: 2,
        area: 1500,
        floor: 1,
        totalFloors: 1,
        furnished: "Semi-Furnished",
        yearBuilt: 2018,
        parking: 1,
        features: ["Garden", "Parking", "Community Park", "Near School"],
        seller: sellerId,
        images: [
          imageUrls.Home[3],
          imageUrls.Home[4],
          imageUrls.Home[5]
        ],
        roomImages: roomImageUrls.Home[1]
      },
      {
        title: "Premium Bungalow Home",
        description: "Elegant home with large garden and modern amenities. Features modular kitchen, pooja room, and spacious bedrooms.",
        price: 11000000,
        location: "Surat",
        type: "Home",
        status: "available",
        bedrooms: 4,
        bathrooms: 3,
        area: 3200,
        floor: 1,
        totalFloors: 1,
        furnished: "Furnished",
        yearBuilt: 2022,
        parking: 2,
        features: ["Large Garden", "Parking", "Modular Kitchen", "Pooja Room", "Study Room"],
        seller: sellerId,
        images: [
          imageUrls.Home[6],
          imageUrls.Home[7],
          imageUrls.Home[8]
        ],
        roomImages: roomImageUrls.Home[2]
      },
      // Farmhouse properties
      {
        title: "Farmhouse Retreat",
        description: "Peaceful farmhouse with greenery and organic farm. Perfect for weekend getaways and nature lovers.",
        price: 18000000,
        location: "Pune",
        type: "Farmhouse",
        status: "available",
        bedrooms: 4,
        bathrooms: 3,
        area: 5200,
        floor: 1,
        totalFloors: 1,
        furnished: "Semi-Furnished",
        yearBuilt: 2021,
        parking: 4,
        features: ["Garden", "Parking", "Well", "Fruit Trees", "Organic Farm", "Barn"],
        seller: sellerId,
        images: [
          imageUrls.Farmhouse[0],
          imageUrls.Farmhouse[1],
          imageUrls.Farmhouse[2]
        ],
        roomImages: roomImageUrls.Farmhouse[0]
      },
      {
        title: "Punjab Farmhouse",
        description: "Spacious farmhouse with green surroundings. Features traditional architecture and modern amenities.",
        price: 4500000,
        location: "Punjab",
        type: "Farmhouse",
        status: "available",
        bedrooms: 3,
        bathrooms: 2,
        area: 4000,
        floor: 1,
        totalFloors: 1,
        furnished: "Semi-Furnished",
        yearBuilt: 2017,
        parking: 3,
        features: ["Garden", "Parking", "Farm Land", "Tube Well", "Traditional Design"],
        seller: sellerId,
        images: [
          imageUrls.Farmhouse[3],
          imageUrls.Farmhouse[4],
          imageUrls.Farmhouse[5]
        ],
        roomImages: roomImageUrls.Farmhouse[1]
      },
      {
        title: "Green Valley Farmhouse",
        description: "Farmhouse surrounded by lush green fields and grape vineyard. Ideal for agricultural enthusiasts.",
        price: 6500000,
        location: "Nashik",
        type: "Farmhouse",
        status: "available",
        bedrooms: 3,
        bathrooms: 2,
        area: 4500,
        floor: 1,
        totalFloors: 1,
        furnished: "Semi-Furnished",
        yearBuilt: 2020,
        parking: 3,
        features: ["Garden", "Parking", "Grape Vineyard", "Well", "Wine Cellar"],
        seller: sellerId,
        images: [
          imageUrls.Farmhouse[6],
          imageUrls.Farmhouse[7],
          imageUrls.Farmhouse[8]
        ],
        roomImages: roomImageUrls.Farmhouse[2]
      }
    ];

    await Property.insertMany(properties);

    console.log("✅ Properties Seeded Successfully with Unique Images!");
    console.log(`📸 Added ${properties.length} properties with unique images for each`);

    // Verify the seeded data
    const allProperties = await Property.find();
    console.log("\n📊 Property Image Summary:");
    allProperties.forEach((prop, index) => {
      console.log(`${index + 1}. ${prop.title}`);
      console.log(`   Main Images: ${prop.images?.length || 0}`);
      console.log(`   Room Images:`, {
        exterior: prop.roomImages?.exterior?.length || 0,
        bedroom: prop.roomImages?.bedroom?.length || 0,
        bathroom: prop.roomImages?.bathroom?.length || 0,
        livingRoom: prop.roomImages?.livingRoom?.length || 0,
        diningRoom: prop.roomImages?.diningRoom?.length || 0,
        kitchen: prop.roomImages?.kitchen?.length || 0
      });
    });

    process.exit();

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

importData();