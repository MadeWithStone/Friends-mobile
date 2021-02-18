import React from "react"
import FeedFunctions from "../Pages/Home/Feed/feedFunctions"

describe("Feed: downloadUsers", () => {
  test("it should return a list of posts", () => {
    const input = [
      [],
      {
        data: {
          email: "Maxhs2014@gmail.com",
          firstName: "Test",
          friendCode: "VC1U80C",
          friends: [
            {
              date: "2021-02-15T20:19:35.383Z",
              userID: "pM2FMA5a4ahnpfd74Q4DnO4gp4m2",
            },
          ],
          id: "IJzXZnpgM0gcyMt3e3BobN4ZzQf1",
          lastName: "",
          posts: [
            "7c1ffa70-7005-11eb-979e-5d0d2a33042f",
            "5f49d310-6fcb-11eb-ae6c-2ffc485c6744",
          ],
        },
      },
    ]
    const output = [
      [
        "99a268e0-7167-11eb-845f-4939a2b11ba3",
        "5ce50070-706d-11eb-979e-5d0d2a33042f",
        "7c1ffa70-7005-11eb-979e-5d0d2a33042f",
        "5f49d310-6fcb-11eb-ae6c-2ffc485c6744",
      ],
      [
        {
          email: "maxwell.s.school@gmail.com",
          firstName: "Maxwell",
          friendCode: "J0XL80C",
          friendRequests: [],
          friends: [
            {
              date: "2021-02-15T20:19:35.383Z",
              userID: "IJzXZnpgM0gcyMt3e3BobN4ZzQf1",
            },
          ],
          id: "pM2FMA5a4ahnpfd74Q4DnO4gp4m2",
          lastName: "Stone",
          posts: [
            "99a268e0-7167-11eb-845f-4939a2b11ba3",
            "5ce50070-706d-11eb-979e-5d0d2a33042f",
            "c93303d0-6ff0-11eb-ae58-311e0670d9d8",
            "6176fe60-6fee-11eb-9ab3-3f2de641c004",
          ],
          profileImage:
            "https://firebasestorage.googleapis.com/v0/b/friends-cloud-9d9cb.appspot.com/o/pM2FMA5a4ahnpfd74Q4DnO4gp4m2%2FpM2FMA5a4ahnpfd74Q4DnO4gp4m2.jpg?alt=media&token=038de9f7-e15a-4c65-9e74-37f0f6504a42",
        },
      ],
    ]
    return FeedFunctions.downloadUsers(...input).then((data) => {
      expect(data).toEqual(output)
    })
  })
})

describe("Feed: downloadPosts", () => {
  test("it should return a list of posts", () => {
    const input = [
      [
        "99a268e0-7167-11eb-845f-4939a2b11ba3",
        "5ce50070-706d-11eb-979e-5d0d2a33042f",
      ],
      false,
      [],
    ]
    const output = [
      {
        comments: [
          {
            comment: "Sooo cute",
            date: "2021-02-17T22:23:15.052Z",
            userID: "GS49jXqjbDNajOEDI0FOVULVToi1",
          },
        ],
        date: "2021-02-17T21:32:16.338Z",
        description: "Valentines Day",
        id: "99a268e0-7167-11eb-845f-4939a2b11ba3",
        image:
          "https://firebasestorage.googleapis.com/v0/b/friends-cloud-9d9cb.appspot.com/o/pM2FMA5a4ahnpfd74Q4DnO4gp4m2%2F99a268e0-7167-11eb-845f-4939a2b11ba3.jpg?alt=media&token=4129fc45-335b-4a8b-a511-57c1058af89b",
        userID: "pM2FMA5a4ahnpfd74Q4DnO4gp4m2",
      },
    ]
    return FeedFunctions.downloadPosts(...input).then((data) => {
      expect(data).toEqual(output)
    })
  })
})
